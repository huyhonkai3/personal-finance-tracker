// controllers/transactionController.js
const Transaction = require("../models/Transaction");
const Category = require("../models/Category");

// =============================================
// @desc    Tạo giao dịch mới
// @route   POST /api/transactions
// @access  Private
// =============================================
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

    const categoryDoc = await Category.findOne({
      _id: categoryId,
      $or: [{ user: req.user._id }, { user: null }],
    });
    if (!categoryDoc) {
      return res.status(404).json({
        message: "Danh mục không tồn tại hoặc bạn không có quyền sử dụng.",
      });
    }
    if (categoryDoc.type !== type) {
      return res.status(400).json({
        message: `Danh mục ${categoryDoc.name} thuộc loại giao dịch ${categoryDoc.type}, không khớp với loại giao dịch ${type}`,
      });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      amount,
      type,
      category: categoryId,
      date: date || Date.now(),
      note: note ? note.trim() : "",
    });

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
    if (error.name === "CastError") {
      return res.status(400).json({ message: "ID danh mục không hợp lệ" });
    }
    return res.status(500).json({ message: "Lỗi server khi tạo giao dịch." });
  }
};

// =============================================
// @desc    Lấy danh sách giao dịch (có lọc + phân trang)
// @route   GET /api/transactions
// @access  Private
// =============================================
const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, month, year, type } = req.query;
    const filter = { user: req.user._id };

    if (type && ["income", "expense"].includes(type)) filter.type = type;

    if (month && year) {
      const m = parseInt(month);
      const y = parseInt(year);
      filter.date = {
        $gte: new Date(y, m - 1, 1),
        $lte: new Date(y, m, 0, 23, 59, 59, 999),
      };
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [total, transactions] = await Promise.all([
      Transaction.countDocuments(filter),
      Transaction.find(filter)
        .populate("category", "name color icon type")
        .sort({ date: -1 })
        .skip(skip)
        .limit(limitNum),
    ]);

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
        balance: summary.totalIncome - summary.totalExpense,
      },
      data: transactions,
    });
  } catch (error) {
    console.error("Lỗi khi lấy giao dịch:", error);
    return res.status(500).json({ message: "Lỗi server khi lấy giao dịch." });
  }
};

// =============================================
// @desc    Cập nhật giao dịch
// @route   PUT /api/transactions/:id
// @access  Private
// =============================================
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Không tìm thấy giao dịch" });
    }
    if (transaction.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền chỉnh sửa giao dịch này" });
    }

    const { amount, type, categoryId, date, note } = req.body;
    const allowedUpdates = {};

    if (amount !== undefined) {
      if (amount <= 0)
        return res.status(400).json({ message: "Số tiền phải lớn hơn 0" });
      allowedUpdates.amount = amount;
    }
    if (type !== undefined) allowedUpdates.type = type;
    if (date !== undefined) allowedUpdates.date = date;
    if (note !== undefined) allowedUpdates.note = note?.trim();

    if (categoryId !== undefined) {
      const categoryDoc = await Category.findOne({
        _id: categoryId,
        $or: [{ user: null }, { user: req.user._id }],
      });
      if (!categoryDoc) {
        return res.status(404).json({
          message: "Danh mục không tồn tại hoặc bạn không có quyền sử dụng.",
        });
      }
      const finalType = allowedUpdates.type ?? transaction.type;
      if (categoryDoc.type !== finalType) {
        return res.status(400).json({
          message: `Danh mục "${categoryDoc.name}" thuộc loại "${categoryDoc.type}", không khớp với loại giao dịch "${finalType}"`,
        });
      }
      allowedUpdates.category = categoryId;
    }

    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      { $set: allowedUpdates },
      { new: true, runValidators: true },
    ).populate("category", "name color icon type");

    return res.status(200).json({
      message: "Giao dịch đã được cập nhật thành công",
      data: updated,
    });
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

// =============================================
// @desc    Xóa giao dịch
// @route   DELETE /api/transactions/:id
// @access  Private
// =============================================
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Không tìm thấy giao dịch" });
    }
    if (transaction.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xóa giao dịch này" });
    }
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

// =============================================
// ============ ANALYTICS FUNCTIONS ============
// =============================================

// =============================================
// @desc    Tổng quan thu/chi trong tháng
// @route   GET /api/transactions/summary?month=6&year=2025
// @access  Private
// =============================================
const getTransactionSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp tháng và năm (month, year)" });
    }

    const m = parseInt(month);
    const y = parseInt(year);

    const result = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: {
            $gte: new Date(y, m - 1, 1),
            $lte: new Date(y, m, 0, 23, 59, 59, 999),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
          },
          totalExpense: {
            $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const data = result[0] || { totalIncome: 0, totalExpense: 0, count: 0 };

    return res.status(200).json({
      message: "Lấy tổng quan giao dịch thành công",
      data: {
        month: m,
        year: y,
        totalIncome: data.totalIncome,
        totalExpense: data.totalExpense,
        balance: data.totalIncome - data.totalExpense,
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

// =============================================
// @desc    Chi tiêu theo danh mục (Donut Chart)
// @route   GET /api/transactions/category-expense?month=6&year=2025
// @access  Private
// =============================================
const getExpenseByCategory = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp tháng và năm (month, year)" });
    }

    const m = parseInt(month);
    const y = parseInt(year);

    const result = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: "expense",
          date: {
            $gte: new Date(y, m - 1, 1),
            $lte: new Date(y, m, 0, 23, 59, 59, 999),
          },
        },
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      // FIX: $unwind phải có trước $project để categoryInfo là object chứ không phải mảng
      {
        $unwind: {
          path: "$categoryInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          categoryId: "$_id",
          name: "$categoryInfo.name",
          color: "$categoryInfo.color",
          icon: "$categoryInfo.icon",
          totalAmount: 1,
          count: 1,
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    const totalExpense = result.reduce(
      (sum, item) => sum + item.totalAmount,
      0,
    );

    const dataWithPercent = result.map((item) => ({
      ...item,
      percentage:
        totalExpense > 0
          ? Math.round((item.totalAmount / totalExpense) * 1000) / 10 // 1 chữ số thập phân
          : 0,
    }));

    return res.status(200).json({
      message: "Lấy chi tiêu theo danh mục thành công",
      data: { month, year, totalExpense, categories: dataWithPercent },
    });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiêu theo danh mục:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server khi lấy chi tiêu theo danh mục" });
  }
};

// =============================================
// @desc    Xu hướng thu/chi theo tháng trong năm
// @route   GET /api/transactions/monthly-trend?year=2025
// @access  Private
// =============================================
const getMonthlyTrend = async (req, res) => {
  try {
    const { year } = req.query;
    const y = year ? parseInt(year) : new Date().getFullYear();
    const startDate = new Date(y, 0, 1);
    const endDate = new Date(y, 11, 31, 23, 59, 59, 999);

    const result = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$date" }, // FIX: $month không phải $monthy
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    // Khởi tạo 12 tháng = 0 để tháng trống vẫn xuất hiện trong chart
    const monthMap = new Map();
    for (let i = 1; i <= 12; i++) {
      monthMap.set(i, { month: i, income: 0, expense: 0 });
    }

    result.forEach(({ _id, total }) => {
      const entry = monthMap.get(_id.month);
      if (entry) entry[_id.type] = total;
    });

    const trendData = Array.from(monthMap.values()).map((item) => ({
      ...item,
      balance: item.income - item.expense,
    }));

    return res.status(200).json({
      message: "Lấy xu hướng giao dịch theo tháng thành công",
      data: { year: y, months: trendData },
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
