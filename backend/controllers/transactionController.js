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
      return res.status(400).json({ messag: "ID danh mục không hợp lệ" });
    }

    return res.status(500).json({
      message: "Lỗi server khi tạo giao dịch.",
    });
  }
};

const getTransactions = async (req, res) => {
  try {
    // Lấy query params để lọc giao dịch
    const { type, startDate, endDate, limit = 50 } = req.query;

    // Build query filter theo user hiện tại
    const filter = { user: req.user._id };

    if (type && ["income", "expense"].includes(type)) {
      filter.type = type;
    }

    // lọc theo thời gian
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter)
      // populate nhúng thông tin category vào kết quả
      .populate("category", "name color icon type")
      .sort({ date: -1 }) // mới nhất trước
      .limit(parseInt(limit));

    // Tính tổng thu nhập và chi tiêu ở đây
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
      count: transactions.length,
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

module.exports = {
  createTransaction,
  getTransactions,
};
