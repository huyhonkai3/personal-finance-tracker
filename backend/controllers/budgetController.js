// controllers/budgetController.js
const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const Category = require("../models/Category");

/**
 * @desc Tạo budget mới cho một danh mục trong tháng/năm
 * @route POST /api/budgets
 * @access Private
 */
const createBudget = async (req, res) => {
  try {
    const { category, amount, month, year } = req.body;

    // Validate đầu vào
    if (!category || !amount || !month || !year) {
      return res.status(400).json({
        message: "Vui lòng cung cấp đầy đủ: danh mục, số tiền, tháng và năm",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Hạn mức phải lớn hơn 0" });
    }

    /**
     * Kiểm tra category tồn tại và có thuộc expense
     * Budget chỉ có ý nghĩa cho expense - không ai đặt ngân sách cho 'thu nhập'
     * Nếu không check, user có thể tạo budget cho category 'Lương'.
     */
    const categoryDoc = await Category.findOne({
      _id: category,
      $or: [{ user: null }, { user: req.user._id }],
    });

    if (!categoryDoc) {
      return res.status(404).json({
        message: "Danh mục không tồn tại hoặc bạn không có quyền sử dụng",
      });
    }

    if (categoryDoc.type !== "expense") {
      return res.status(400).json({
        message: `Danh mục ${categoryDoc.name} là loại thu nhập. Chỉ có thể đặt ngân sách cho danh mục chi tiêu`,
      });
    }

    /**
     * Kiểm tra đã tồn tại budget cho category này trong tháng/năm này chưa
     * Schema đã có unique index, nhưng kiểm tra ở đây để trả về thông báo tiếng việt rõ ràng
     * thay vì để Mongoose throw lỗi 11000 (MongoServerError: duplicate key)
     */
    const existing = await Budget.findOne({
      user: req.user._id,
      category,
      month: Number(month),
      year: Number(year),
    });

    if (existing) {
      return res.status(409).json({
        message: `Bạn đã đặt ngân sách cho "${categoryDoc.name}" trong tháng ${month}/${year} rồi. Vui lòng cập nhạt budget hiện có thay vì tạo mới.`,
      });
    }

    const budget = await Budget.create({
      user: req.user._id,
      category,
      amount: Number(amount),
      month: Number(month),
      year: Number(year),
    });

    // Populate để response trả về đầy đủ thông tin category ngay
    await budget.populate("category", "name color icon type");

    return res.status(201).json({
      message: "Tạo ngân sách thành công",
      data: budget,
    });
  } catch (error) {
    console.error("Create budget error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: errors.join(", ") });
    }

    // MongoDB duplicate key - trường hợp race condition (2 request gần nhau cùng tạo)
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Ngân sách cho danh mục này trong tháng/năm đã tồn tại",
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({ message: "ID danh mục không hợp lệ" });
    }

    return res.status(500).json({ message: "Lỗi server khi tạo ngân sách" });
  }
};

/**
 * @desc Lấy danh sách budget của user trong tháng/năm
 * @route GET /api/budget?month=6&year=2025
 * @access Private
 */
const getBudgets = async (req, res) => {
  try {
    const { month, year } = req.query;

    // Nếu không truyền tháng/năm, lấy mặc định tháng hiện tại
    const now = new Date();
    const targetMonth = month ? Number(month) : now.getMonth() + 1;
    const targetYear = year ? Number(year) : now.getFullYear();

    const budgets = await Budget.find({
      user: req.user._id,
      month: targetMonth,
      year: targetYear,
    }).populate("category", "name color icon type");

    return res.status(200).json({
      message: "Lấy danh sách ngân sách thành công",
      count: budgets.length,
      data: budgets,
    });
  } catch (error) {
    console.error("Lấy danh sách ngân sách lỗi: ", error);
    return res.status(500).json({ message: "Lỗi server khi lấy ngân sách" });
  }
};

/**
 * @desc Tính tiến độ chi tiêu thực tế so với ngân sách
 * @route GET /api/budgets/progress?month=6&year=2025
 * @access Private
 */
const getBudgetProgress = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const targetMonth = month ? Number(month) : now.getMonth() + 1;
    const targetYear = year ? Number(year) : now.getFullYear();

    // Bước 1: Lấy tất cả budgets của user trong tháng/năm
    const budgets = await Budget.find({
      user: req.user._id,
      month: targetMonth,
      year: targetYear,
    }).populate("category", "name color icon type");

    if (budgets.length === 0) {
      return res.status(200).json({
        message: "Không có ngân sách nào trong tháng này",
        count: 0,
        data: [],
      });
    }

    /**
     * Bước 2 + 3
     * Dùng MongoDB Aggregation ($match + $group) thay vì N lần Transaction.find() trong vòng lặp.
     * 1 Agrregation duy nhất tính tổng theo nhóm category:
     *  $match: Lọc transaction của user trong tháng/năm, chỉ lấy expense
     *  $group: Nhóm theo category._id, tính SUM (amount) mỗi nhóm -> chỉ 1 round-trip dù có bao nhiêu budgets.
     *
     * Kết quả: [{_id: categoryId, totaSpent: 1500000}]
     * Ta dùng Map để tra cứu 0(1) thay vì .find() O(n) trong vòng lặp
     */

    // Tính khoảng thời gian của tháng
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    // Lấy ID của các category có budget (để chỉ aggregate những category liên quan)
    const categoryIds = budgets.map((b) => b.category._id);

    const spentAggregation = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: "expense",
          category: { $in: categoryIds }, // Chỉ lấy các category có budget
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        // $group: Nhóm tất cả transaction theo category, cộng dồn amount
        // _id là key của nhóm - ta nhóm thoe category._id
        $group: {
          _id: "$category",
          totalSpent: { $sum: "$amount" },
        },
      },
    ]);

    // Chuyển kết quả aggregation thành Map để tra cứu nhanh O(1)
    // Key: categoryId (string), Value: totalSpent (number)
    const spentMap = new Map(
      spentAggregation.map((item) => [item._id.toString(), item.totalSpent]),
    );

    // Bước 4: Gộp dữ liệu budget + spent thành response
    const progressData = budgets.map((budget) => {
      const categoryId = budget.category._id.toString();
      const spentAmount = spentMap.get(categoryId) || 0; // 0 nếu chưa chi gì

      return {
        _id: budget._id,
        category: budget.category,
        budgetAmount: budget.amount,
        spentAmount,
        remainingAmount: budget.amount - spentAmount,
        // Phần trăm đã dùng - clamp tối đa 100 để UI không bị vỡ layout
        percentUsed: Math.min(
          100,
          Math.round((spentAmount / budget.amount) * 100),
        ),
        // Flag cảnh báo vượt ngân sách - frontend dùng để đổi màu warning
        isOverBudget: spent.Amount > budget.amount,
        month: budget.month,
        year: budget.year,
      };
    });

    // Sắp xếp: budget sắp vượt ngưỡng (percentUsed cao) lên đâu
    // để user thấy ngay các danh mục cần chú ý
    progressData.sort((a, b) => b.percentUsed - a.percentUsed);

    return res.status(200).json({
      message: "Lấy tiến độ ngân sách thành công",
      count: progressData.length,
      data: progressData,
    });
  } catch (error) {
    console.error("Get budget progress error:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server khi tính tiến độ ngân sách" });
  }
};

/**
 * @desc Cập nhật hạn mức budget
 * @route PUT /api/budgets/:id
 * @access Private
 */
const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res
        .status(404)
        .json({ message: "Bạn không có quyền chỉnh sửa ngân sách này." });
    }

    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Hạn mức phải lớn hơn 0." });
    }

    /**
     * Chỉ cho phép cập nhật 'amount'
     * Không cho phép đổi category/month/year vì sẽ phá vỡ unique constraint và làm mất đi ý nghĩa lịch sử của budget
     * Nếu muốn đổi category, user nên xóa budget cũ và tạo lại.
     */
    const updated = await Budget.findByIdAndUpdate(
      req.params.id,
      { $set: { amount: Number(amount) } },
      { new: true, runValidators: true },
    ).populate("category", "name color icon type");

    return res.status(200).json({
      message: "Cập nhật ngân sách thành công",
      data: updated,
    });
  } catch (error) {
    console.error("Update budet error: ", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: errors.join(", ") });
    }

    return res
      .status(500)
      .json({ message: "Lỗi server khi cập nhật ngân sách" });
  }
};

/**
 * @desc Xóa budget
 * @route DELETE /api/budgets/:id
 * @access Private
 */
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ message: "Không tìm thấy ngân sách" });
    }

    if (budget.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xóa ngân sách này" });
    }

    await budget.deleteOne();

    return res.status(200).json({
      message: "Xóa ngân sách thành công",
      data: { _id: req.params.id },
    });
  } catch (error) {
    console.error("Delete budget error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({ message: "ID ngân sách không hợp lệ" });
    }

    return res.status(500).json({ message: "Lỗi server khi xóa ngân sách" });
  }
};

module.exports = {
  createBudget,
  getBudgets,
  getBudgetProgress,
  updateBudget,
  deleteBudget,
};
