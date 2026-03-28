// Cấu hình kết nối MongoDB
const mongoose = require("mongoose");

/*
 * Hàm kết nối đến MongoDB
 */
const connectDB = async () => {
  try {
    // mongoose.connect() trả về một Promise, ta dùng async/await để xử lý
    // process.env.MONGO_URI: đọc biến môi trường từ .env (đã load bởi dotenv trong server.js)
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // Log ra host của DB để dễ debug khi có nhiều môi trường (local, staging, production)
    // conn.connection.host cho biết đang kết nối đến server MongoDB nào
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    // Nếu kết nối thất bại, in lỗi ra và dừng toàn bộ tiến trình Node.js
    // process.exit(1) nghĩa là thoát với mã lỗi (1 = có lỗi xảy ra)
    // Lý do: Nếu không có DB, server chạy cũng vô nghĩa và sẽ bị crash sau đó
    console.error(`MongoDB Connection Error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
