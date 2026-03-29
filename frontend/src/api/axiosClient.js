// src/api/axiosClient.js
/**
 * Backend dùng HTTP-Only Cookie - trình duyệt tự động gửi cookie kèm theo mọi request khi có 'withCredentials: true'
 * Ta không thể đọc cookie httpOnly bằng JS.
 */
import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
  /**
   * Bắt buộc phải có để browser gửi kèm cookie trong mọi request.
   * Nếu thiếu mọi route protected đều bị 401 dù cookie đang tồn tại trên trình duyệt.
   */
  withCredentials: true,
});

// REQUESTE INTERCEPTOR
axiosClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

// RESPONSE INTERCEPTORS
axiosClient.interceptors.response.use(
  (response) => response.data,

  (error) => {
    const status = error.response?.status;
    const isLoginEndpoint = error.config?.url?.includes("/auth/login");

    if (status === 401 && !isLoginEndpoint) {
      // Xóa user khỏi store (import động để tránh circular dependency)
      import("@/store/authStore").then(({ default: useAuthStore }) => {
        useAuthStore.getState().logout();
      });
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
