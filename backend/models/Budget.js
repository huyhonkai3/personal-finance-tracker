// models/Budget.js - Schema cho Collection Budgets
// Budget lưu hạn mức chi tiêu của user theo từng danh mục, từng tháng/năm
// VD: "Tháng 7/2025, tôi chỉ cho phép bản thân chi tối đa 3 triệu cho Ăn uống"
const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    // Người dùng sở hữu budget này
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Budget phải thuộc về một người dùng"],
    },
    // Danh mục áp dụng hạn mức
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Budget phải thuộc về một danh mục"],
    },
    // Số tiền hạn mức tối đa cho phép trong tháng
    amount: {
      type: Number,
      required: [true, "Vui lòng nhập số tiền hạn mức tối đa cho phép"],
      min: [1, "Hạn mức tối thiểu phải lớn hơn 0"],
    },
    // Tháng áp dụng (1-12)
    month: {
      type: Number,
      required: [true, "Vui lòng chọn tháng"],
      // Validate tháng phải nằm trong khoảng 1-12
      min: [1, "Tháng phải nằm trong khoảng 1-12"],
      max: [12, "Tháng phải nằm trong khoảng 1-12"],
    },
    // Năm áp dụng
    year: {
      type: Number,
      required: [true, "Vui lòng chọn năm"],
      // Validate năm hợp lý (không cho đặt budget cho năm quá khứ xa)
      min: [2020, "Năm không hợp lệ"],
    },
  },
  { timestamps: true },
);

// Compound unique index trên (user, category, month, year)
// Lý do: Mỗi user chỉ được đặt 1 budget cho 1 category trong 1 tháng/năm cụ thể
// Nếu không có, user có thể vô tình tạo 2 budget cho cùng "Ăn uống - Tháng 7/2025" gây ra lỗi logic tính toán
// Thêm unique: true vào đây vừa tạo index vừa enforce constraint ở tầng DB
budgetSchema.index(
  { user: 1, category: 1, month: 1, year: 1 },
  { unique: true },
);

// Index để query nhanh budget của user trong một tháng/năm cụ thể
// VD: Lấy tất cả budget của user X trong tháng 7/2025
budgetSchema.index({ user: 1, month: 1, year: 1 });

const Budget = mongoose.model("Budget", budgetSchema);

module.exports = Budget;
