// middlewares/authMiddleware.js - Bảo vệ các route cần đăng nhập
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/*
 * Middleware xác thực JWT Token
 * Gắn vào route nào thì route đó yêu cầu user phải đăng nhập.
 * Cách dùng: router.get('/profile', protect, getProfile)
 */
const protect = async (req, res, next) => {
  /*
   * Token giờ nằm trong cookie tên 'jwt', không còn trong header Authorization
   * req.cookies được parse bởi middleware cookieParser() trong server.js
   */
  const token = req.cookies?.jwt;

  /*
   * Giữ lai khả năng đọc từ Authorization Header làm fallback
   * Hữu ích khi test bằng Postman (không tự gửi cookie) hoặc khi có mobile app dùng Bearer token
   */
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
    /*
     * jwt.verify(): Giải mã và kiểm tra chữ ký + hạn sử dụng của token
     * Ném lỗi nếu: token giả mạo, bị sửa hoặc bị hết hạn
     */
    const decoded = jwt.verify(activeToken, process.env.JWT_SECRET);

    /* Lấy thông tin user từ DB và gắn vào req
     * .select('-password'): Lấy tất cả fields trừ password
     */
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Token không hợp lệ - tài khoản không tồn tại" });
    }

    // Xác thực thành công, chuyển sang handler tiếp theo
    next();
  } catch (error) {
    /*
     * JsonWebToken: Token sai định dạng hoặc bị giả mạo
     * TokenExpiredError: Token đã hết hạn
     */
    console.error("Auth middleware error: ", error.message);
    return res
      .status(401)
      .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};

module.exports = { protect };
