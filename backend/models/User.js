// =============================================
// models/User.js - Schema cho Collection Users (Ngày 2: Thêm mã hóa mật khẩu)
// =============================================

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // 🐛 BUG ĐÃ FIX: `require` -> `required` (typo khiến validation không hoạt động âm thầm)
      required: [true, "Vui lòng nhập tên"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Vui lòng nhập email"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Vui lòng nhập mật khẩu"],
      minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
    },
  },
  { timestamps: true },
);

// =============================================
// Mongoose Pre-save Hook: Tự động hash password trước khi lưu vào DB
// =============================================
// Middleware này chạy TRƯỚC mỗi lần document.save() được gọi
// Dùng function() thông thường (KHÔNG dùng arrow function) vì ta cần `this`
// `this` ở đây trỏ đến document đang được lưu (tức là object User)
userSchema.pre("save", async function (next) {
  // isModified("password"): kiểm tra xem field password có bị thay đổi không
  // TỐI ƯU (Junior): Nếu user chỉ cập nhật tên/email (không đổi password),
  // ta bỏ qua bước hash để tránh hash lại password đã được hash -> sẽ gây lỗi đăng nhập!
  if (!this.isModified("password")) {
    return next();
  }

  // genSalt(10): Tạo "muối" với độ phức tạp 10 vòng lặp (cost factor)
  // Con số 10 là chuẩn cân bằng giữa bảo mật và hiệu năng - đủ an toàn mà không quá chậm
  const salt = await bcrypt.genSalt(10);

  // hash(): Kết hợp password gốc + salt -> tạo ra chuỗi hash hoàn toàn mới
  // Gán thẳng lại vào this.password để Mongoose lưu chuỗi hash thay vì plaintext
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// =============================================
// Instance Method: So sánh mật khẩu khi đăng nhập
// =============================================
// Instance method được gọi trên một document cụ thể: user.matchPassword("abc123")
// `this` ở đây trỏ đến user document, nên ta lấy được this.password (password đã hash)
userSchema.methods.matchPassword = async function (enteredPassword) {
  // bcrypt.compare(): So sánh plaintext với hash đã lưu trong DB
  // Hàm này tự xử lý salt bên trong, ta không cần làm thủ công
  // Trả về: true nếu khớp, false nếu không khớp
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
