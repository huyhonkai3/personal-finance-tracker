// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
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
// Pre-save Hook: Hash password trước khi lưu
// =============================================
// FIX "next is not a function":
// Mongoose pre-save hook với async function cần KHÔNG truyền `next` vào tham số.
// Thay vào đó, dùng cú pháp Promise-based — hook là async, chỉ cần return bình thường.
// Nếu truyền `next` vào async function, Mongoose v8+ sẽ nhận nhầm `next` là argument
// đầu tiên của Promise chain, gây lỗi "next is not a function".
userSchema.pre("save", async function () {
  // Chỉ hash khi password bị thay đổi
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// =============================================
// Instance Method: So sánh password khi đăng nhập
// =============================================
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
