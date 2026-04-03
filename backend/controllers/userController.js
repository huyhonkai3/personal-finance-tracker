// controllers/userController.js
const User = require("../models/User");

/**
 * @desc Lấy thông tin profile của user hiện tại
 * @route GET /api/users/profile
 * @access Private
 */
const getUserProfile = async (req, res) => {
  try {
    /**
     * Vì sao dùng .select('-password')?
     * Mặc định query sẽ trả về password (dù đã hash)
     * -> dễ bị leak khi log/ trả API/ cache
     *
     * Hash bị lộ vẫn nguy hiểm (có thể brute force hoặc bị reuse)
     * Nguyên tắc: chỉ trả dữ liệu cần thiết (Least Privilege)
     * -> luôn loại bỏ password khỏi response
     */
    const user = await User.findById(req.user._id).select("-password");
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng." });

    return res.status(200).json({
      message: "Lấy thông tin profile thành công",
      data: user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server khi lấy thông tin profile." });
  }
};

/**
 * @desc Cập nhật thông tin profile (name, email)
 * @route PUT /api/users/profile
 * @access Private
 */
const updateUserProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name && !email) {
      return res.status(400).json({
        message:
          "Vui lòng cung cấp ít nhất một thông tin cần cập nhật (name hoặc email).",
      });
    }

    // nếu user muốn đổi email, kiểm tra email mới chưa được dùng bởi user khác
    if (email) {
      const emailTaken = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: req.user._id }, // loại trừ chính user hiện tại
      });
    }

    // Build update object - chỉ set field nào được truyền lên
    const updateFields = {};
    if (name) updateFields.name = name.trim();
    if (email) updateFields.email = email.toLowerCase().trim();

    /**
     * new: true -> trả về document sau khi update
     * runValidators: true -> mongoose chạy lại schema validation
     * select: '-password' ->  loại trừ password ngay trong query, không phải strip sau
     */
    const updateUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updateUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    return res.status(200).json({
      message: "Cập nhật thông tin thành công",
      data: updateUser``,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: errors.join(", ") });
    }

    // Duplicate key error - email đã tồn tại (race condition giữa check và save)
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email này đã được sử dụng." });
    }

    return res
      .status(500)
      .json({ message: "Lỗi server khi cập nhật thông tin" });
  }
};

/**
 * @desc Đổi mật khẩu
 * @route PUT /api/users/change-password
 * @access Private
 */
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    // Validate input
    if (!oldPassword || !!newPassword) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp mật khẩu cũ và mật khẩu mới." });
    }

    if (newPassword < 6) {
      return res.status(400).json({
        message: "Mật khẩu mới phải có ít nhất 6 ký tự.",
      });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({
        message: "Mật khẩu mới không được trùng với mật khẩu cũ.",
      });
    }

    /**
     * .select('+password') -> cần password hash để verify mật khẩu cũ nhưng req.user đã bị loại password do .select('-password')
     * -> phải query lại và include password
     */
    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(400).json({
        message: "Không tìm thấy người dùng",
      });
    }

    // Kiểm tra mật khẩu cũ - dùng instance method matchPassword() từ User model -> bcrypt.compare(enteredPassword, this.password)
    const isMatch = await User.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({
        message: "Mật khẩu cũ không chính xác",
      });
    }

    /**
     * Không dùng findByIdAndUpdate để đổi password
     * Vì: nó update trực tiếp lên db -> bỏ qua middleware của mongoose
     * pre('save') không chạy -> password không được hash -> lưu plain text
     *
     * Cách đúng: Gán password vào document rồi gọi .save() -> kích hoạt pre('save') -> bcrypt hash trước khi lưu
     * Quy tắc: Cần chạy middleware (hash, validate,...) -> dùng .save(), không dùng update trực tiếp
     */
    user.password = newPassword;
    await user.save(); // pre('save') hook sẽ tự động hash password

    return res.status(200).json({
      message: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại nếu cần.",
    });
  } catch (error) {
    console.error("Change password error:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: errors.join(", ") });
    }

    return res.status(500).json({
      message: "Lỗi server khi đổi mật khẩu.",
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword,
};
