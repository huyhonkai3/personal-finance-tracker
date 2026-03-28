// =============================================
// controllers/authController.js - Xử lý logic Auth (Ngày 3: Cookie + Logout)
// =============================================
// Controller là nơi chứa "business logic" - xử lý request và trả về response

// 🐛 BUG ĐÃ FIX: `../models/userModel` -> `../models/User`
// File thực tế tên là User.js (viết hoa), import sai tên là lỗi runtime ngay khi server khởi động
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// =============================================
// @desc    Đăng ký tài khoản mới
// @route   POST /api/auth/register
// @access  Public
// =============================================
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // --- Validate dữ liệu đầu vào ---
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
  }

  // --- Kiểm tra email đã tồn tại chưa ---
  // .lean(): Trả về plain JS object thay vì Mongoose document đầy đủ
  // Nhanh hơn vì ta chỉ cần kiểm tra sự tồn tại, không cần gọi methods/virtuals
  const userExists = await User.findOne({ email }).lean();
  if (userExists) {
    return res.status(409).json({ message: "Email này đã được đăng ký" });
  }

  // --- Tạo user mới ---
  // Pre-save hook trong User.js tự động hash password trước khi lưu vào DB
  const user = await User.create({ name, email, password });

  if (!user) {
    return res.status(400).json({ message: "Dữ liệu người dùng không hợp lệ" });
  }

  // --- Sinh token và gắn vào HTTP-Only Cookie ---
  // Ngày 3: Gọi generateToken(res, id) thay vì generateToken(id)
  // Hàm này tự gắn cookie vào response, ta không cần return token trong body nữa
  generateToken(res, user._id);

  // HTTP 201 Created - Trả về thông tin user (KHÔNG có token trong body nữa)
  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    // TỐI ƯU (Junior): Trả thêm createdAt để frontend có thể hiển thị "Tham gia từ..."
    createdAt: user.createdAt,
  });
};

// =============================================
// @desc    Đăng nhập
// @route   POST /api/auth/login
// @access  Public
// =============================================
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu" });
  }

  const user = await User.findOne({ email });

  // Gộp 2 điều kiện vào 1 câu if -> chống Username Enumeration Attack
  // Tách ra 2 câu: kẻ tấn công biết được email nào đã đăng ký -> nguy hiểm
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
  }

  // Sinh token và gắn vào cookie
  generateToken(res, user._id);

  // 201 = Created (tạo resource mới). Đăng nhập là đọc dữ liệu, không tạo mới -> phải là 200 OK
  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
  });
};

// =============================================
// @desc    Đăng xuất - Xóa cookie JWT
// @route   POST /api/auth/logout
// @access  Private (cần đăng nhập)
// =============================================
const logoutUser = (req, res) => {
  // Cách xóa cookie: Ghi đè bằng cookie cùng tên nhưng giá trị rỗng và expires = quá khứ
  // Trình duyệt nhận cookie đã hết hạn sẽ tự xóa nó
  // Lưu ý: KHÔNG xóa được cookie httpOnly bằng JavaScript phía client - đây chính là lý do dùng httpOnly
  res.cookie("jwt", "", {
    httpOnly: true,
    // new Date(0) = Unix Epoch = 01/01/1970 -> Cookie đã hết hạn ngay lập tức
    expires: new Date(0),
  });

  res.status(200).json({ message: "Đã đăng xuất thành công" });
};

// =============================================
// @desc    Lấy thông tin profile của user đang đăng nhập
// @route   GET /api/auth/profile
// @access  Private
// =============================================
// TỐI ƯU (Junior): Thêm sẵn endpoint getProfile vì đây là endpoint gần như
// project nào cũng cần ngay sau khi làm xong auth. Middleware `protect` đã
// gắn `req.user` vào request nên controller này cực đơn giản.
const getUserProfile = async (req, res) => {
  // req.user được gắn bởi middleware `protect` trong authMiddleware.js
  // Đã loại bỏ password từ trước trong middleware rồi, an toàn để trả thẳng
  const user = req.user;

  if (!user) {
    return res.status(404).json({ message: "Không tìm thấy người dùng" });
  }

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  });
};

module.exports = { registerUser, loginUser, logoutUser, getUserProfile };
