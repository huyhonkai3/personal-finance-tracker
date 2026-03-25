// models/Transaction.js - Schema cho Collection Transactions
// Đây là collection TRUNG TÂM của ứng dụng, lưu mọi giao dich thu/chi
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    // Liên kết đến User sở hữu giao dịch này - bắt buộc
    // ref: User cho phép dùng .populate('user') để lấy đầy đủ thông tin user sau này
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Giao dịch phải thuộc về một người dùng"],
    },
    // Số tiền giao dịch - bắt buộc, phải là số dương
    amount: {
      type: Number,
      required: [true, "Vui lòng nhập số tiền"],
      // Validate số tiền phải > 0
      // Tránh ghi nhận giao dịch vô nghĩa như 0đ hoặc số âm
      min: [0, "Số tiền phải là số dương"],
    },
    // Loại giao dịch: thu nhập hay chi tiêu
    type: {
      type: String,
      enum: {
        values: ["income", "expense"],
        message: "Loại giao dịch phải là income hoặc expense",
      },
      required: [true, "Vui lòng chọn loại giao dịch"],
    },
    // Liên kết đến Category
    // Quan hệ: mỗi giao dịch thuộc về 1 danh mục
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Vui lòng chọn danh mục"],
    },
    // Ngày thực hiện giao dịch - mặc định là thời điểm hiện tại
    date: {
      type: Date,
      default: Date.now,
    },
    // Ghi chú thêm
    note: {
      type: String,
      trim: true,
      // Giới hạn độ dài note để tránh spam dữ liệu vào DB
      maxlength: [500, "Ghi chú không được vượt quá 500 ký tự"],
    },
  },
  { timestamps: true },
);

// Index compound trên (user, date) - đây là QUAN TRỌNG NHẤT trong dự án này
// Lý do: 90% query sẽ là "lấy giao dịch của user X trong tháng Y"
// -> Transaction.find({ user: userId, date: { $gte: startDate, $lte: endDate } })
// Index này giúp MongoDB tìm kiếm cực nhanh thay vì scan toàn bộ collection
transactionSchema.index({ user: 1, date: -1 }); // date: -1 để sort giảm dần (mới -> cũ)

// Index thêm cho (user, type) để query "tổng thu trong tháng" nhanh hơn
transactionSchema.index({ user: 1, type: 1 });

// Index cho (user, category) để query "chi tiêu theo danh mục" nhanh hơn
transactionSchema.index({ user: 1, category: 1 });

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
