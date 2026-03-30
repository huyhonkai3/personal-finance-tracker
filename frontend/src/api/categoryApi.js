// src/api/categoryApi.js
import axiosClient from "./axiosClient";

// GET /api/categories
export const getCategories = () => axiosClient.get("/categories");
