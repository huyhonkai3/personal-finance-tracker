// controllers/transactionController.js
const Transaction = require("../models/Transaction");
const Category = require("../models/Category");

/**
 * @desc Tạo giao dịch mới
 * @route POST /api/transactions
 * @access Private
 */
const createTransaction = async (req, res) => {
  try {
    const { amount, type, categoryId, date, note } = req.body;

    if (!amount || !type || !categoryId) {
      return res.status(400).json({
        message: "Vui lòng cung cấp số tiền, loại giao dịch và danh mục",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Số tiền phải lớn hơn 0" });
    }

    // Kiểm tra category có tồn tại và thuộc về user hoặc là hệ thống
    const categoryDoc = await Category.findOne({
      _id: categoryId,
      $or: [{ user: req.user._id }, { user: null }],
    });

    if (!categoryDoc) {
      return res.status(404).json({
        message: "Danh mục không tồn tại hoặc bạn không có quyền sử dụng.",
      });
    }

    // Kiểm tra type của giao dịch khớp với type của category - VD: ko cho phép tạo giao dịch income với category type expense
    if (categoryDoc.type !== type) {
      return res.status(400).json({
        message: `Danh mục ${categoryDoc.name} thuộc loại giao dịch ${categoryDoc.type}, không khớp với loại giao dịch ${type}`,
      });
    }

    const transaction = await Transaction.create({
      user: req.user._id, // lấy từ middleware protect, không cần client gửi lên
      amount,
      type,
      category: categoryId,
      date: date || Date.now(),
      note: note ? note.trim() : "",
    });

    // populate category để trả về tên category cho client
    await transaction.populate("category", "name color icon type");

    return res.status(201).json({
      message: "Giao dịch đã được tạo thành công",
      data: transaction,
    });
  } catch (error) {
    console.error("Lỗi khi tạo giao dịch:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: errors.join(", ") });
    }

    // CastError: ID category không đúng định dạng ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({ message: "ID danh mục không hợp lệ" });
    }

    return res.status(500).json({
      message: "Lỗi server khi tạo giao dịch.",
    });
  }
};

const getTransactions = async (req, res) => {
  try {
    // Lấy query params để lọc giao dịch
    const { page = 1, limit = 20, month, year, type } = req.query;

    // Build query filter theo user hiện tại
    const filter = { user: req.user._id };

    if (type && ["income", "expense"].includes(type)) {
      filter.type = type;
    }

    // $gte (greater than or equal): ngày >= ngày đầu tháng
    // $lte (less than or equal):    ngày <= ngày cuối tháng
    //
    // Ví dụ: Lọc tháng 6/2025
    //   startDate = new Date(2025, 5, 1)   -> 01/06/2025 00:00:00 (tháng 0-indexed nên tháng 6 = index 5)
    //   endDate   = new Date(2025, 6, 0)   -> 30/06/2025 23:59:59 (ngày 0 của tháng 7 = ngày cuối tháng 6)
    //
    // Trick "ngày 0": new Date(year, month, 0) trả về ngày cuối của tháng trước.
    // Dùng cách này vì JS tự xử lý tháng 28/29/30/31 ngày — mình không cần lo.
    if (month && year) {
      const m = parseInt(month);
      const y = parseInt(year);
      const startDate = new Date(y, m - 1, 1);
      const endDate = new Date(y, m, 0, 23, 59, 59, 999);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    // PAGINATION
    const pageNum = Math.max(1, parseInt(page)); // đảm bảo page >= 1
    const limitNum = Math.max(1, Math.min(100, parseInt(limit))); // giới hạn limit từ 1 đến 100
    const skip = (pageNum - 1) * limitNum;

    /**
     * Chạy đồng thời 2 query để tối ưu thời gian:
     * - countDocuments: đếm tổng số record khớp filter (không load data)
     * - find: lấy data trang hiện tại
     */
    const [total, transactions] = await Promise.all([
      Transaction.countDocuments(filter),
      Transaction.find(filter)
        .populate("category", "name color icon type")
        .sort({ date: -1 })
        .skip(skip)
        .limit(limitNum),
    ]);

    // SUMMARY - Tính tổng thu nhập và chi tiêu ở đây
    const summary = transactions.reduce(
      (acc, tx) => {
        if (tx.type === "income") acc.totalIncome += tx.amount;
        if (tx.type === "expense") acc.totalExpense += tx.amount;
        return acc;
      },
      { totalIncome: 0, totalExpense: 0 },
    );

    return res.status(200).json({
      message: "Lấy danh sách giao dịch thành công",
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
      summary: {
        ...summary,
        balance: summary.totalIncome - summary.totalExpense, // số dư = thu nhập - chi tiêu
      },
      data: transactions,
    });
  } catch (error) {
    console.error("Lỗi khi lấy giao dịch:", error);
    return res.status(500).json({ message: "Lỗi server khi lấy giao dịch." });
  }
};

/**
 * @desc Cập nhật giao dịch
 * @route PUT /api/transactions/:id
 * @access Private
 */
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Không tìm thấy giao dịch" });
    }

    /**
     * Tại sao phải dùng .toString() khi so sánh ObjectId?
     * - transaction.user là ObjectId (kiểu đặc biệt của MongoDB)
     * - req.user._id cũng là ObjectId
     * - Nếu so sánh trực tiếp (transaction.user === req.user._id), dù cùng giá trị nhưng sẽ trả về false vì là 2 object khác nhau trong bộ nhớ.
     * - Dùng .toString() chuyển cả 2 về chuỗi ID để so sánh giá trị thực sự của chúng.
     */
    if (transaction.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền chỉnh sửa giao dịch này" });
    }

    // Chỉ cho phép cập nhật một số trường nhất định
    const { amount, type, categoryId, date, note } = req.body;
    const allowedUpdates = {};

    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({ message: "Số tiền phải lớn hơn 0" });
      }
      allowedUpdates.amount = amount;

      if (type !== undefined) allowedUpdates.type = type;
      if (date !== undefined) allowedUpdates.date = date;
      if (note !== undefined) allowedUpdates.note = note?.trim();

      // nếu categoryId được cung cấp, kiểm tra tính hợp lệ và quyền sử dụng
      if (categoryId !== undefined) {
        const categoryDoc = await Category.findOne({
          _id: categoryId,
          $or: [{ user: req.user._id }, { user: null }],
        });

        if (!categoryDoc) {
          return res.status(404).json({
            message: "Danh mục không tồn tại hoặc bạn không có quyền sử dụng.",
          });
        }

        // Lấy type cuối cùng (có thể client đang đổi type cùng lúc với category)
        const finalType = allowedUpdates.type ?? transaction.type;
        if (categoryDoc.type !== finalType) {
          return res.status(400).json({
            message: `Danh mục ${categoryDoc.name} thuộc loại giao dịch ${categoryDoc.type}, không khớp với loại giao dịch ${finalType}`,
          });
        }

        allowedUpdates.category = categoryId;
      }

      /**
       * {new: true} -> trả về document sau khi update (không phải document cũ)
       * {runValidators: true} -> Mongoose chạy lại validation của schema trước khi lưu
       */
      const updated = await Transaction.findByIdAndUpdate(
        req.params.id,
        { $set: allowedUpdates },
        { new: true, runValidators: true },
      ).populate("category", "name color icon type");

      return res.status(200).json({
        message: "Giao dịch đã được cập nhật thành công",
        data: updated,
      });
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật giao dịch:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: errors.join(", ") });
    }

    if (error.name === "CastError") {
      return res.status(400).json({ message: "ID giao dịch không hợp lệ" });
    }

    return res
      .status(500)
      .json({ message: "Lỗi server khi cập nhật giao dịch." });
  }
};

/**
 * @desc Xóa giao dịch
 * @route DELETE /api/transactions/:id
 * @access Private
 */
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Không tìm thấy giao dịch" });
    }

    // Kiểm tra quyền của user
    if (transaction.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xóa giao dịch này" });
    }

    /**
     * Dùng instance method .deleteOne() vì nếu sau này thêm Mongoose middleware "pre('deleteOne')" (VD: xóa data liên quan),
     * cách này sẽ kích hoạt middleware đó còn findByIdAndDelete() thì không.
     */
    await transaction.deleteOne();

    return res.status(200).json({
      message: "Giao dịch đã được xóa thành công",
      data: { _id: req.params.id },
    });
  } catch (error) {
    console.error("Lỗi khi xóa giao dịch:", error);

    if (error.name === "CastError") {
      return res.status(400).json({ message: "ID giao dịch không hợp lệ" });
    }

    return res.status(500).json({ message: "Lỗi server khi xóa giao dịch." });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
};
