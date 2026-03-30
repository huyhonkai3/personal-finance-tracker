// src/api/transactionApi.js
import axiosClient from "./axiosClient";

// POST /api/transactions
export const createTransaction = (data) =>
  axiosClient.post("/transactions", data);

// GET /api/transactions?page=&limit=&month=&year=&type=
// params là object: { page, limit, month, year, type }
// Axios tự chuyển object thành query string: ?month=6&year=2025&type=expense
export const getTransactions = (params = {}) =>
  axiosClient.get("/transactions", { params });

// PUT /api/transactions/:id
export const updateTransaction = (id, data) =>
  axiosClient.put("/transactions/" + id, data);

// DELETE /api/transactions/:id
export const deleteTransaction = (id) =>
  axiosClient.delete("/transactions/" + id);
