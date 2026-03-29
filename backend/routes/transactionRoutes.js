// routes/transactionRoutes.js

const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const {
  createTransaction,
  getTransactions,
} = require("../controllers/transactionController");

router.use(protect);

router
  .route("/")
  .get(getTransactions) // GET  /api/transactions
  .post(createTransaction); // POST /api/transactions

module.exports = router;
