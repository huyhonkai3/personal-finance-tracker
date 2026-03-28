// src/api/authApi.js - Auth API Functions
/**
 * Tập trung tất cả các call liên quan đến Auth vào 1 file.
 * Component không cần biết URL cụ thể - chỉ gọi hàm từ đây.
 */
import axiosClient from "./axiosClient";

/**
 * Đăng nhập (email, mật khẩu)
 * Response trả về trực tiếp response.data (đã unwrap bởi interceptor)
 * @param {{emai: string, password: string}} data
 * @returns {{ _id, name, email, token }} user info + JWT token
 */
export const loginApi = (data) => axiosClient.post("/auth/login", data);

/**
 * Đăng ký tài khoản mới
 * @param {{name: string, email: string, password: string}} data
 * @returns {{_id, name, email, token}} user info + JWT token
 */
export const registerApi = (data) => axiosClient.post("/auth/register", data);

/**
 * Đăng xuất - gọi API để server xóa cookie/refresh token.
 * Zustand store được clear ở component (không phải ở đây).
 */
export const logoutApi = () => axiosClient.post("/auth/logout");

/**
 * Lấy thông tin user hiện tại
 * Dùng để verify token còn hợp lệ khi app khởi động.
 */
export const getMeApi = () => axiosClient.get("/auth/profile");
