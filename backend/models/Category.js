// models/Category.js - Schema cho Collection Categories
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    // Tên danh mục
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên danh mục"],
      trim: true,
    },
    // Loại danh mục: thu nhập/chi tiêu
    type: {
      type: String,
      // enum: Chỉ cho phép 2 giá trị này. Nếu truyền vào giá trị khác, Mongoose sẽ báo lỗi validation
      enum: {
        values: ["income", "expense"],
        message: "Loại danh mục phải là income hoặc expense",
      },
      required: [true, "Vui lòng chọn loại danh mục"],
    },
    // Màu sắc cho UI (lưu dưới dạng mã hex)
    color: {
      type: String,
      // Đặt một màu mặc định thay vì để null
      // Giúp frontend không bị lỗi render nếu quên truyền color
      default: "#607D8B",
    },
    // Tên icon (VD: 'food', 'salary') - frontend sẽ map tên này ra icon tương ứng
    icon: {
      type: String,
      default: "default",
    },
    // Liên kết đến User tạo ra danh mục này
    // ref: 'User' -> khi dùng .populate('user'), Mongoose sẽ biết cần lấy data từ collection 'users'
    // Nếu user là null -> đây là danh mục mặc định của hệ thống (dùng chung cho tất cả user)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null = default category của hệ thống
    },
  },
  { timestamps: true },
);

// Thêm compound index cho cặp (user, name)
// Lý do: Khi query "lấy danh mục của user X", MongoDB sẽ dùng index này thay vì scan toàn bộ collection
// Kịch bản thực tế: Category.find({ user: userId }) -> nhanh hơn nhiều khi có hàng triệu records
categorySchema.index({ user: 1, name: 1 });

// Index trên 'type' vì ta sẽ thường filter theo loại (chỉ lấy expense categories)
categorySchema.index({ type: 1 });

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
