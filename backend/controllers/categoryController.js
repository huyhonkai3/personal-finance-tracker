// =============================================
// controllers/categoryController.js
// =============================================

const Category = require("../models/Category");

// =============================================
// @desc    Lấy danh sách danh mục
// @route   GET /api/categories
// @access  Private
// =============================================
const getCategories = async (req, res) => {
  try {
    // $or: Lấy danh mục hệ thống (user: null) HOẶC danh mục của user hiện tại
    // Giải thích toán tử $or: MongoDB trả về document thỏa ít nhất 1 điều kiện
    // Tại sao cần lấy cả null? -> Danh mục hệ thống dùng chung mọi user (VD: "Ăn uống", "Lương")
    const categories = await Category.find({
      $or: [{ user: null }, { user: req.user._id }],
    }).sort({ type: 1, name: 1 }); // Sắp xếp: loại trước, rồi tên A-Z

    return res.status(200).json({
      message: "Lấy danh sách danh mục thành công",
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    return res.status(500).json({ message: "Lỗi server khi lấy danh mục" });
  }
};

// =============================================
// @desc    Tạo danh mục riêng của user
// @route   POST /api/categories
// @access  Private
// =============================================
const createCategory = async (req, res) => {
  try {
    const { name, type, color, icon } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        message: "Vui lòng cung cấp tên và loại danh mục",
      });
    }

    // Kiểm tra trùng tên trong danh mục của user + hệ thống
    const existing = await Category.findOne({
      name: name.trim(),
      $or: [{ user: null }, { user: req.user._id }],
    });

    if (existing) {
      return res.status(409).json({
        message: `Danh mục "${name}" đã tồn tại`,
      });
    }

    const category = await Category.create({
      name: name.trim(),
      type,
      color: color || "#607D8B",
      icon: icon || "default",
      user: req.user._id, // Gắn với user đang đăng nhập
    });

    return res.status(201).json({
      message: "Tạo danh mục thành công",
      data: category,
    });
  } catch (error) {
    console.error("Create category error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: errors.join(", ") });
    }

    return res.status(500).json({ message: "Lỗi server khi tạo danh mục" });
  }
};

module.exports = { getCategories, createCategory };
