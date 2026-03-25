// routes/authRoutes.js - Định nghĩa các endpoint xác thực
// Router đóng vai trò "bảng chỉ đường": request đến đường nào, controller nào xử lý
// Tách routes ra file riêng giúp server.js gọn gàng và dễ mở rộng
const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");

// express.Router(): Tạo một mini-app router độc lập
// Sau đó được mount vào app chính trong server.js với prefix '/api/auth'
const router = express.Router();

// POST /api/auth/register -> Gọi hàm registerUser trong controller
router.post("/register", registerUser);

// POST /api/auth/login -> Gọi hàm loginUser trong controller
router.post("/login", loginUser);

module.exports = router;
