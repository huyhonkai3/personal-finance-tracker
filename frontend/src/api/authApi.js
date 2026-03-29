// src/api/authApi.js - Auth API Functions
/**
 * Tập trung tất cả các call liên quan đến Auth vào 1 file.
 * Component không cần biết URL cụ thể - chỉ gọi hàm từ đây.
 */
import axiosClient from "./axiosClient";

export const loginApi = (data) => axiosClient.post("/auth/login", data);
export const registerApi = (data) => axiosClient.post("/auth/register", data);
export const logoutApi = () => axiosClient.post("/auth/logout");

// Dùng để verify cookie khi app khởi động (App.jsx)
// Nếu cookie còn hợp lệ -> server trả user info
// Nếu cookie hết hạn -> server trả 401 -> interceptor tự xử lý
export const getMeApi = () => axiosClient.get("/auth/profile");
