// routes/transactionRoutes.js

const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");

router.use(protect);

router
  .route("/")
  .get(getTransactions) // GET  /api/transactions
  .post(createTransaction); // POST /api/transactions

router
  .route("/:id")
  .put(updateTransaction) // PUT /api/transactions/:id
  .delete(deleteTransaction); // DELETE /api/transactions/:id

module.exports = router;
