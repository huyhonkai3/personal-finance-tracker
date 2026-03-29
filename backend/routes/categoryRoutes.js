// routes/categoryRoutes.js
const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const {
  getCategories,
  createCategory,
} = require("../controllers/categoryController");

// protect: middleware kiểm tra JWT cookie -> gắn req.user nếu hợp lệ
router.use(protect);

router
  .route("/")
  .get(getCategories) // GET /api/categories
  .post(createCategory); // POST /api/categories

module.exports = router;
