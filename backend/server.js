// Điểm khởi động chính của Backend

// Bước 1: Load biến môi trường từ file .env trước tiên
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

// Import hàm kết nối từ DB từ module riêng
const connectDB = require("./config/db");

// Khởi tạo Express App
const app = express();
const PORT = process.env.PORT || 5000;

// ======== Kết nối Database =========
// Gọi hàm connectDB() ngay khi server khởi động
// Hàm này là async, nếu lỗi nó sẽ tự gọi process.exit()
connectDB();

// =============== Middleware (Chạy trước mọi Route Handler) ================
// cors(): Cho phép frontend (chạy ở domain/port khác) gọi API này
// Ví dụ: Frontend chạy ở localhost:3000, Backend ở localhost:5000 -> cần CORS
// credentials: true -> Cho phép trình duyệt gửi kèm cookie trong cross-origin request
// origin: chỉ định domain frontend được phép gọi (thay vì cho phép tất cả với *)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http:///localhost:3000",
    credentials: true, // Bắt buôc phải có nếu dùng cookie với CORS
  }),
);

// express.json(): Parse body từ JSON string thành JS object (req.body)
// Nếu thiếu middlware này, req.body sẽ là undefined
app.use(express.json);

// cookieParser(): Parse cookie từ request heder thành object (req.cookies)
// Phải có middlware này để đọc JWT từ cookie trong authMiddleware.js
// Nếu thiếu, req.cookies sẽ là undefined và mọi route protected đều trả 401
app.use(cookieParser());

// morgan('dev'): Tự động log mọi HTTP request ra console (method, path, status, thời gian)
// VD: GET /api/transactions 200 15.234ms
// Rất hữu ích khi debug,chỉ nên dùng trong môi trường development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ========== Routes ===========
// Route kiểm tra server đang chạy
app.get("/", (req, res) => {
  res.json({ message: "API is running..." });
});
// Auth routes: Đăng ký, Đăng nhập
// Mọi request đến /api/auth/... sẽ được chuyển vào authRoutes để xử lý
app.use("/api/auth", require("./routes/authRoutes"));

// ========== Global Error Handler Middleware ===========
// Đây là middleware đặc biệt với 4 tham số (err, req, res, next)
// Express nhận ra đây là error handler và chỉ gọi khi có lỗi được pass qua next(err)
// Nếu không có cái này, lỗi server sẽ expose stack trace cho client - rất nguy hiểm!
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({
    message: err.message || "Lỗi máy chủ nội bộ",
    // Chỉ hiện stack trace trong môi trường development để debug
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// ========== Khởi động Server ===========
app.listen(PORT, () => {
  console.log(
    `Server đang chạy ở chế độ ${process.env.NODE_ENV} trên cổng ${PORT}`,
  );
});

// ============ Xử lý Unhandled Promise Rejection =============
// Fresher thường quên xử lý case này!
// Khi có một Promise bị reject mà không có .catch() nào bắt nó,
// Node.js sẽ emit sự kiện 'unhandledRejection'.
// Nếu không xử lý, trong Node.js phiên bản mới, process sẽ tự exit - rất nguy hiểm trên production!
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Promise Rejection tại:", promise, "Lý do:", reason);
  // server là biến không tồn tại -> ReferenceError khi crash
  // app.listen() không trả về biến server, phải dùng process.exit() trực tiếp
  // Hoặc lưu kết quả app.listen() vào biến nếu muốn graceful shutdown
  process.exit(1);
});

// Xử lý Uncaught Exception (lỗi đồng bộ không được catch)
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});
