// src/api/transaction.js
import axiosClient from "./axiosClient";

// POST /api/transactions
export const createTransaction = (data) =>
  axiosClient.post("transactions", data);

// GET /api/transactions?page=&limit=&month=&year=&type=
export const getTransactions = (params = {}) =>
  axiosClient.get("/transactions", { params });

// PUT /api/transactions/:id
export const updateTransaction = (id, data) =>
  axiosClient.put("/transactions/" + id, data);

// DELETE /api/transactions/:id
export const deleteTransaction = (id) =>
  axiosClient.delete("/transactions/" + id);
