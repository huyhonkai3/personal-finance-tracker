// routes/userRoutes.js
const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const {
  getUserProfile,
  updateProfile,
  changePassword,
  updateUserProfile,
} = require("../controllers/userController");

// Tất cả route user đều yêu cầu đăng nhập
router.use(protect);

router
  .route("/profile")
  .get(getUserProfile) // GET /api/users/profile
  .put(updateUserProfile); // PUT /api/users/profile

router.put("/change-password", changePassword); // PUT /api/users/change-password

module.exports = router;
