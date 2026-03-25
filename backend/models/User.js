// models/User.js - Schema cho Collection Users
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Tên người dùng
    name: {
      type: String,
      require: [true, "Vui lòng nhập tên"], // Custom error message rõ ràng hơn là chỉ 'required: true'
      trim: true, // Tự động xóa khoảng trắng thừa ở đầu/cuối chuỗi
    },
    // Email - bắt buộc & duy nhất
    email: {
      type: String,
      required: [true, "Vui lòng nhập email"],
      unique: true, // Tạo unique index trên MongoDB, không cho phép 2 user cùng email
      trim: true,
      // Chuẩn hóa email về chữ thường trước khi lưu
      // Tránh trường hợp 'Test@Gmail.com' và 'test@gmail.com' bị coi là 2 user khác nhau
      lowercase: true,
    },
    // Mật khẩu: Đây chỉ là Schema. Logic hash password (bcrypt) sẽ được xử lý ở tần Service/Controller
    password: {
      type: String,
      required: [true, "Vui lòng nhập mật khẩu"],
      minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
    },
  },
  // timestamps: true -> Mongoose tự động thêm 2 fields: createAt và updateAt
  // Hữu ích để biết user đăng ký khi nào, cập nhật lần cuối khi nào
  { timestamps: true },
);

// Thêm index cho email để tìm kiếm nhanh hơn
// userSchema.index({ email: 1 }); -> đã được tạo tự động bởi unique: true, không cần khai báo lại

const User = mongoose.model("User", userSchema);

module.exports = User;
