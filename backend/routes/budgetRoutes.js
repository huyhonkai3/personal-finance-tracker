// routes/budgetRoutes.js

const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const {
  createBudget,
  getBudgets,
  getBudgetProgress,
  updateBudget,
  deleteBudget,
} = require("../controllers/budgetController");

// Tất cả route budget đều yêu cầu đăng nhập
router.use(protect);

// Route /progress phải khai báo TRƯỚC route /:id
// Lý do: Express khớp route theo thứ tự từ trên xuống.
// Nếu /:id đứng trước, Express sẽ hiểu "progress" là một :id cụ thể
// -> getBudget(id="progress") -> CastError vì "progress" không phải ObjectId hợp lệ.
// Quy tắc vàng: Route literal (chuỗi cố định) luôn khai báo TRƯỚC route dynamic (:param).
router.get("/progress", getBudgetProgress); // GET /api/budgets/progress?month=6&year=2025

router
  .route("/")
  .get(getBudgets) // GET  /api/budgets?month=6&year=2025
  .post(createBudget); // POST /api/budgets

router
  .route("/:id")
  .put(updateBudget) // PUT    /api/budgets/:id
  .delete(deleteBudget); // DELETE /api/budgets/:id

module.exports = router;
