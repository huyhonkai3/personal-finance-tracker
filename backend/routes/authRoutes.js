// routes/authRoutes.js - Định nghĩa các endpoint xác thực
// Router đóng vai trò "bảng chỉ đường": request đến đường nào, controller nào xử lý
// Tách routes ra file riêng giúp server.js gọn gàng và dễ mở rộng
const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
} = require("../controllers/authController");
// Import middleware protect để bảo vệ các route cần đăng nhập
const { protect } = require("../middlewares/authMiddleware");

// express.Router(): Tạo một mini-app router độc lập
// Sau đó được mount vào app chính trong server.js với prefix '/api/auth'
const router = express.Router();

// --- Public routes (Không cần đăng nhập) ---
// POST /api/auth/register
router.post("/register", registerUser);
// POST /api/auth/login
router.post("/login", loginUser);

// Protected routes (cần đăng nhập - thêm middleware protect vào giữa) ---
// Cú pháp: router.METHOD(path, middleware, handler)
// `protect` chạy trước `logoutUser`, nếu không có token hợp lệ thì chặn lại luôn
router.post("/logout", protect);
router.get("/profile", protect, getUserProfile);

module.exports = router;
