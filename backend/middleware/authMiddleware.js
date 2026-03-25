// middleware/authMiddleware.js - Bảo vệ các route cần đăng nhập
// Tạo sẵn file này dù kế hoạch ngày 2 chưa yêu cầu.
// Lý do: Controller của Ngày 3 (CRUD transactions) sẽ cần ngay.
// Chuẩn bị trước giúp Ngày 3 không bị gián đoạn.
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/*
 * Middleware xác thực JWT Token
 * Gắn vào route nào thì route đó yêu cầu user phải đăng nhập.
 * Cách dùng: router.get('/profile', protect, getProfile)
 */
const protect = async (req, res, next) => {
  let token;

  // Token được gửi trong HTTP Header theo chuẩn Bearer:
  // Authorization: Bearer <token>
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Tách lấy phần token sau chữ "Bearer "
      token = req.headers.authorization.split(" ")[1];

      // jwt.verify(): Giải mã và xác thực token
      // Nếu token hết hạn hoặc bị giả mạo -> ném lỗi JsonWebTokenError
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Gắn thông tin user vào req để các handler sau có thể dùng
      // .select('-password'): Lấy tất cả fields trừ password
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({message: "Token không hợp lệ - user không tồn tại"});
      }

      next(); // User đã xác thực, chuyển sang route handler tiếp theo
    } catch (error) {
      return res.status(401).json({message: "Token không hợp lệ hoặc đã hết hạn"})''
    }
  }

  if (!token) {
    return res.status(401).json({message: "Không có token, truy cập bị từ chối"});
  }
};

module.exports = { protect };
