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

/**
 * ANALYTICS FUNCTIONS
 * Tại sao phải dùng Aggregation Pipeline?
 * Fresher thường làm:
 *  - const txs = await Transaction.find(filter) -> kéo toàn bộ data về Node.js
 *  - const total = txs.reduce((sum, tx) => ..., 0) -> tính toán trong JS
 * Nếu user có 100.000 giao dịch -> Nodejs phải load 100.000 object vào RAM -> Server hết bộ nhớ -> crash hoặc chậm.
 *
 * Dùng Aggregation Pipeline để MongoDB tự tính toán ở tầng Database.
 * Nodejs chỉ nhận kết quả đã được tổng hợp - dù có 100.000 dòng, response vẫn chỉ là vài con số nhỏ. Database được tối ưu cho việc này, nodejs thì không
 */

/**
 * @desc Tổng quan thu/chi trong tháng
 * @route GET /api/transactions/summary?month=6&year=2025
 * @access Private
 */
const getTransactionSummary = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        message: "Vui lòng cung cấp tháng và năm (month, year)",
      });
    }

    const m = parseInt(month);
    const y = parseInt(year);
    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59, 999);

    /**
     * $match - bộc lọc đầu vào của pipeline
     * nên đật $match lên đầu để mongo dùng index lọc bớt document ngay từ đầu, tránh xử lý document thừa ở các stage sau.
     * không có $match đầu -> toàn bộ collection phải đi qua pipeline -> rất chậm.
     */
    const result = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id, // chỉ lấy giao dịch của user này
          date: { $gte: startDate, $lte: endDate }, // trong tháng/năm yêu cầu
        },
      },
      /**
       * $group - nhóm tất cả document thành 1 kết quả duy nhất
       * _id: null có nghĩa 'không nhóm theo trường nào, gộp tất cả thành 1 nhóm'.
       * $cond: điều kiện - nếu type == 'income' thì cộng amount vào totalIncome, ngược lại cộng 0 (không đếm). Tương tự cho totalExpense
       */
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
          },
          totalExpense: {
            $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
          },
          count: { $sum: 1 }, // đếm tổng số giao dịch
        },
      },
    ]);
    /**
     * aggregation trả về mảng - nếu không có giao dịch nào thì mảng rỗng []
     * Dùng result[0] để lấy document đầu tiên, fallback 0 nếu không có data
     */
    const data = result[0] || { totalIncome: 0, totalExpense: 0, count: 0 };

    return res.status(200).json({
      message: "Lấy tổng quan giao dịch thành công",
      data: {
        month: m,
        year: y,
        totalIncome: data.totalIncome,
        totalExpense: data.totalExpense,
        balance: data.totalIncome - data.totalExpense, // số dư = thu - chi
        count: data.count,
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy tổng quan giao dịch:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server khi lấy tổng quan giao dịch" });
  }
};

/**
 * @desc Chi tiêu theo danh mục (dữ liệu Donut Chart)
 * @route GET /api/transactions/category-expense?month=6&year=2025
 * @access Private
 */
const getExpenseByCategory = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({
        message: "Vui lòng cung cấp tháng và năm (month, year)",
      });
    }
    const m = parseInt(month);
    const y = parseInt(year);
    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59, 999);

    const result = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: "expense",
          date: { $gte: startDate, $lte: endDate },
        },
      },
      /**
       * Khi _id là một giá trị cụ thể ($category)
       * mongo tạo ra một nhóm riêng cho mỗi giá trị category._id duy nhất
       * $sum: '$amount' -> cộng dồn amount của tất cả transaction trong mỗi nhóm
       * Kết quả: [ { _id: <categoryId>, totalAmount: 1500000, count: 3 }, ... ]
       */
      {
        $group: {
          _id: "$category", // nhóm theo category ObjectId
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },

      /**
       * $lookup - JOIN với collection categories
       * Tương đương SQL: LEFT JOIN categories ON categories._id = transaction.category
       * from: tên collection muốn join (categories)
       * localField: field trong collection hiện tại (Transaction._id sau group = categoryId)
       * foreignField: field trong collection kia để match (_id của Category)
       * as: tên field chứa kết quả join (mảng)
       */
      {
        $lookup: {
          from: "categories", //mongo collection name (lowercase, plural)
          localField: "_id",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      /**
       * $unwind: Bung mảng categoryInfo (luôn có 1 phần tử) thành object phẳng
       * preserveNullAndEmptyArrays: true -> giữ lại nhóm nếu category bị xóa
       * (không bị lọc mất khỏi kết quả, tránh mất data)
       */
      {
        $project: {
          _id: 0, // ẩn _id gốc của group
          categoryId: "$_id",
          name: "$categoryInfo.name",
          color: "$categoryInfo.color",
          icon: "$categoryInfo.icon",
          totalAmount: 1,
          count: 1,
        },
      },

      // Sort theo tổng tiền giảm dần
      { $sort: { totalAmount: -1 } },
    ]);

    // Tính tổng chi để frontend tính $ cho Donut Chart
    const totalExpense = result.reduce(
      (sum, item) => sum + item.totalAmount,
      0,
    );

    // Thêm percentage vào mỗi item
    const dataWithPercent = result.map((item) => ({
      ...item,
      percentage:
        totalExpense > 0
          ? Math.round((item.totalAmount / totalExpense) * 100 * 10) / 10 // làm tròn chữ số thập phân
          : 0,
    }));

    return res.status(200).json({
      message: "Lấy chi tiêu theo danh mục thành công",
      data: {
        month,
        year,
        totalExpense,
        categories: dataWithPercent,
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiêu theo danh mục:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server khi lấy chi tiêu theo danh mục" });
  }
};

/**
 * @desc Xu hướng thu/chi theo tháng trong năm (Area/Bar Chart)
 * @route GET /api/transactions/monthly-trend?year=2025
 * @access Private
 */
const getMonthlyTrend = async (req, res) => {
  try {
    const { year } = req.query;
    const y = year ? parseInt(year) : new Date().getFullYear();
    const startDate = new Date(y, 0, 1); // 01/01/year
    const endDate = new Date(y, 11, 31, 23, 59, 59, 999); // 31/12/year

    const result = await Transaction.aggregate([
      // Stage 1: $match - lọc tất cả giao dịch của user trong năm
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: endDate },
        },
      },

      /**
       * $group theo tháng + loại giao dịch
       * $month: 'date' là 'toán tử ngày tháng' của mongo - trích xuất số tháng (1-12) từ field date mà không cần JS code
       */
      {
        $group: {
          _id: {
            month: { $monthy: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },

      // Sort theo tháng tăng dần để frontend không phải sort lại
      { $sort: { "_id.month": 1 } },
    ]);

    // Sau khi Aggregation, reshape data:
    // MongoDB trả về: [{ _id: { month: 1, type: "income" }, total: 5000000 }, ...]
    // Frontend cần:   [{ month: 1, income: 5000000, expense: 3000000 }, ...]
    //
    // Dùng Map để merge 2 document (income, expense) của cùng 1 tháng thành 1 object.
    const monthMap = new Map();

    // Khởi tạo 12 tháng với giá trị 0 để tháng không có giao dịch vẫn xuất hiện
    // (Chart sẽ hiện cột 0 thay vì bỏ trống tháng đó — UX tốt hơn nhiều)
    for (let i = 1; i <= 12; i++) {
      monthMap.set(i, { month: i, income: 0, expense: 0 });
    }

    // Ghi đè giá trị thực tế từ Aggregation result
    result.forEach(({ _id, total }) => {
      const { month, type } = _id;
      const entry = monthMap.get(month);
      if (entry) entry[type] = total; // entry.income = total hoặc entry.expense = total
    });

    // Chuyển Map thành mảng, thêm balance = income - expense
    const trendData = Array.from(monthMap.values()).map((item) => ({
      ...item,
      balance: item.income - item.expense,
    }));

    return res.status(200).json({
      message: "Lấy xu hướng giao dịch theo tháng thành công",
      data: {
        year: y,
        months: trendData, // luôn đủ 12 tháng
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy xu hướng giao dịch:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server khi lấy xu hướng giao dịch" });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
  getExpenseByCategory,
  getMonthlyTrend,
};
