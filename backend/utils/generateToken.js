// utils/ generateToken.js - Tiện ích sinh JWT token
// Tách logic sinh token ra file riêng để tái sử dụng ở nhiều nơi (Auth controller, refresh token endpoint sau này, ...)
const jwt = require("jsonwebtoken");

/*
 * Sinh JWT Access Token cho một user
 * @param {String} id - MongoBD ObjectId của user
 * @returns {string} JWT token  đã được đăng ký
 */
const generateToken = (id) => {
  // jwt.sign(payload, secretKey, options)
  // payload { id }: Thông tin được mã hóa vào token
  // -> Chỉ lưu id, Không lưu email/password vào token để giảm kích thước và tránh bị lộ thông tin nhạy cảm nếu token bị decode
  // process.env.JWT_SECRET: Khóa bí mật dùng để ký và xác thực token
  // -> Không được hard-code ở đây, phải lấy từ biến môi trường
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = generateToken;
