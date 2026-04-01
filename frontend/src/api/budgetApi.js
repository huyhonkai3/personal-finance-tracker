// src/api/budgetApi.js
import axiosClient from "./axiosClient";

// POST /api/budgets
export const createBudget = (data) => axiosClient.post("/budgets", data);

// GET /api/budgets/progress?month=6&year=2025
export const getBudgetProgress = (params = {}) =>
  axiosClient.get("/budgets/progress", { params });

// GET /api/budgets?month=6&year=2025
export const getBudgets = (params = {}) =>
  axiosClient.get("/budgets", { params });

// PUT /api/budgets/:id
export const updateBudget = (id, data) =>
  axiosClient.put("/budgets/" + id, data);

// DELETE /api/budgets/:id
export const deleteBudget = (id) => axiosClient.delete("/budgets/" + id);
