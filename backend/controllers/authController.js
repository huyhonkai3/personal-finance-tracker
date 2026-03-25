// controllers/authController.js - Xử lý logic Đăng ký & Đăng nhập
// Controller là nơi chứa bussines logic - xử lý request và trả về response
// Nó không biết về routing (đó là việc của routes), chỉ làm đúng một việc là xử lý request và trả về response
const User = require("../models/userModel");
const generateToken = require("../utils/generateToken");

/*
 * @desc Đăng ký tài khoản mới
 * @route POST /api/auth/register
 * @access Public (Không cần đăng nhập)
 */
const registerUser = async (req, res) => {
  // Destructure dữ liệu từ request body
  const { name, email, password } = req.body;

  // --- Validate dữ liệu đầu vào ---
  // Luôn validate ở tầng Controller trước khi chạm vào DB
  // Tránh tạo ra các DB query không cần thiết với dữ liệu rõ ràng là thiếu.
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
  }

  // --- Kiểm tra email đã tồn tại chưa ---
  // User.findOne(): Tìm một document khớp với điều kiện { email }
  // Dùng .lean() để nhận plain object thay Mongoose document -> nhanh hơn vì chỉ cần kiểm tra tồn tại
  const userExists = await User.findOne({ email }).lean();
  if (userExists) {
    // 409 Conflict: Tài nguyên đã tồn tại (phù hợp hơn 400 Bad request cho case này)
    return res.status(409).json({ message: "Email này đã được đăng ký" });
  }

  // --- Tạo user mới ---
  // User.create() gọi new User() + document.save() gộp lại
  // Pre-save hook trong User.js sẽ tự động hash password trước khi lưu
  const user = await User.create({ name, email, password });

  // Kiểm tra user được tạo thành công trước khi trả về
  // User.create() có thể trả về null nếu có lỗi validation không được catch
  if (!user) {
    return res.status(400).json({ message: "Dữ liệu người dùng không hợp lệ" });
  }

  // Trả về response thành công
  // HTTP 201 Created: Đúng chuẩn REST khi tạo một resource mới
  // Không bao giờ trả về password (dù đã hash) trong response
  // Luôn chọn lọc fields trả về cho client.
  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    // Token được sinh và gửi về ngay để user không cần đăng nhập lại sau khi đăng ký
    token: generateToken(user._id),
  });
};

/*
 * @desc Đăng nhập
 * @route POST /api/auth/login
 * @access Public
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // --- Validate dữ liệu đầu vào ---
  if (!email || !password) {
    return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu" });
  }

  // --- Tìm user theo email
  // Mặc định Mongoose không select field password khi query
  // vì ta đã không đặt select: false trên schema. Nhưng ở đây ta cần password để so sánh, nên query bình thường là ổn
  const user = await User.findOne({ email });

  // --- Kiểm tra user tồn tại và password khớp ---
  // Gộp 2 điều kkieenj vào 1 câu if để tránh "Username Enumeration Attack"
  // Nếu trách ra: "Email không tồn tại" vs "Sai mật khẩu" -> kẻ tấn công biết email nào đã được đăng ký
  // Gộp lại: luôn trả về "Email hoặc mật khẩu không đúng" -> an toàn hơn
  if (!user || !(await user.matchPassword(password))) {
    // 401 Unauthorized: Xác thực thất bại
    return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
  }

  // --- Đăng nhập thành công ---
  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id),
  });
};

module.exports = { registerUser, loginUser };
