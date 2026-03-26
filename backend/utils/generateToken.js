// utils/ generateToken.js - Tiện ích sinh JWT token & Gắn vào Cookie
// Tách logic sinh token ra file riêng để tái sử dụng ở nhiều nơi
// Ngày 3: Nâng cấp từ "trả token trong body" sang "gắn token vào HTTP-Only Cookie"
const jwt = require("jsonwebtoken");

/*
 * Sinh JWT Token và gắn vào HTTP-Only Cookie trong response
 * Tại sao đổi từ trả token trong body sang Cookie?
 * - Trả token trong body: Frontend phải tự lưu vào localStorage
 *  -> localStorage có thể bị đọc bởi JS -> dễ bị tấn công XSS
 * - Gắn vào HTTP-Only Cookie: Trình duyệt tự quản lý, JS không thể đọc -> chặn được XSS hoàn toàn với cookie này
 * @param {object} res - Express response object (để gắn cookie)
 * @param {String} id - MongoBD ObjectId của user
 */
const generateToken = (res, userId) => {
  // Bước 1: Sinh JWT Token
  // jwt.sign(payload, secretKey, options)
  // payload { id }: Thông tin được mã hóa vào token
  // -> Chỉ lưu id, Không lưu email/password vào token để giảm kích thước và tránh bị lộ thông tin nhạy cảm nếu token bị decode
  // process.env.JWT_SECRET: Khóa bí mật dùng để ký và xác thực token
  // -> Không được hard-code ở đây, phải lấy từ biến môi trường
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  // Bước 2: Gắn token vào cookie thay vì return về để controller đặt trong body
  res.cookie("jwt", token, {
    // httpOnly: true -> QUAN TRỌNG NHẤT
    // JS ở phía client (kể cả code độc hại từ XSS) không thể đọc cookie này
    // Chỉ trình duyệt mới tự động gửi cookie lên server khi request
    httpOnly: true,

    // secure: true -> Chỉ gửi cookie qua HTTPS (không gửi qua HTTP thuần)
    // Trong development dùng HTTP nên tắt đi, production phải bật
    // Đọc từ env thay vì hard-code true/false
    secure: process.env.NODE_ENV !== "development",

    // sameSite: 'strict' -> Chỉ gửi cookie khi request xuất phát từ cùng domain
    // Chặn tấn công CSRF (Cross-Site Request Forgery)
    // Giá trị khác: 'lax' (mặc định, ít nghiêm ngặt hơn), 'none' (không hạn chế - cần secure: true)
    sameSite: "strict",

    // maxAge: Thời gian sống của cookie tính bằng miliseconds
    // 30 ngày = 30 * 24 * 60 * 60 * 1000 ms
    // Tính rõ từng bước thay vì hard-code 2592000000 - dễ đọc, dễ sửa
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  // Return token để authMiddleware.js (đọc từ cookie) có thể dùng lại
  // Đồng thời cho phép test dễ hơn trong môi trường non-browser (Postman, mobile app)
  return token;
};

module.exports = generateToken;
