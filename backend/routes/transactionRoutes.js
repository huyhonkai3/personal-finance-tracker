// =============================================
// routes/transactionRoutes.js
// =============================================

const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  // Analytics — Ngày 15
  getTransactionSummary,
  getExpenseByCategory,
  getMonthlyTrend,
} = require("../controllers/transactionController");

// Tất cả route đều yêu cầu đăng nhập
router.use(protect);

// ===== ANALYTICS ROUTES (tĩnh — phải đặt TRƯỚC /:id) =====
router.get("/summary", getTransactionSummary); // GET /api/transactions/summary
router.get("/category-expense", getExpenseByCategory); // GET /api/transactions/category-expense
router.get("/monthly-trend", getMonthlyTrend); // GET /api/transactions/monthly-trend

// ===== CRUD ROUTES =====
router
  .route("/")
  .get(getTransactions) // GET  /api/transactions
  .post(createTransaction); // POST /api/transactions

// /:id phải đặt SAU tất cả route tĩnh
router
  .route("/:id")
  .put(updateTransaction) // PUT    /api/transactions/:id
  .delete(deleteTransaction); // DELETE /api/transactions/:id

module.exports = router;
