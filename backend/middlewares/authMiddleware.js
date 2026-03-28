// =============================================
// middleware/authMiddleware.js - Bảo vệ route cần đăng nhập (Ngày 3: Đọc token từ Cookie)
// =============================================

const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Middleware xác thực người dùng.
 * Ngày 3: Đọc JWT từ HTTP-Only Cookie thay vì Authorization Header.
 *
 * Cách dùng trong route:
 *   router.get('/profile', protect, getProfile)
 *   router.post('/logout', protect, logoutUser)
 */
const protect = async (req, res, next) => {
  // Ngày 3: Token giờ nằm trong cookie tên "jwt", không còn trong header Authorization
  // req.cookies được parse bởi middleware cookieParser() trong server.js
  const token = req.cookies?.jwt;

  // TỐI ƯU (Junior): Giữ lại khả năng đọc từ Authorization Header làm fallback
  // Hữu ích khi test bằng Postman (không tự gửi cookie) hoặc khi có mobile app dùng Bearer token
  const headerToken = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null;

  const activeToken = token || headerToken;

  if (!activeToken) {
    return res
      .status(401)
      .json({ message: "Không có token, truy cập bị từ chối" });
  }

  try {
    // jwt.verify(): Giải mã và kiểm tra chữ ký + hạn sử dụng của token
    // Ném lỗi nếu: token giả mạo, bị sửa, hoặc đã hết hạn
    const decoded = jwt.verify(activeToken, process.env.JWT_SECRET);

    // Lấy thông tin user từ DB và gắn vào req để các handler sau dùng
    // .select("-password"): Lấy tất cả fields TRỪ password - không bao giờ để password đi tiếp
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Token không hợp lệ - tài khoản không tồn tại" });
    }

    // Xác thực thành công, chuyển sang handler tiếp theo
    next();
  } catch (error) {
    // JsonWebTokenError: Token sai định dạng hoặc bị giả mạo
    // TokenExpiredError: Token đã hết hạn
    console.error("Auth middleware error:", error.message);
    return res
      .status(401)
      .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};

module.exports = { protect };
