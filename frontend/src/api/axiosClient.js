// =============================================
// src/api/axiosClient.js — Axios Instance Trung Tâm
// =============================================
// Tất cả API call trong app đều đi qua file này.
// Không bao giờ gọi `axios.get(...)` trực tiếp — luôn dùng `axiosClient`.
// Lý do: Interceptors ở đây apply cho MỌI request/response tự động.

import axios from "axios";
import useAuthStore from "@/store/authStore";

// =============================================
// 1. TẠO INSTANCE VỚI CONFIG MẶC ĐỊNH
// =============================================
const axiosClient = axios.create({
  // baseURL: Mọi request sẽ tự động prefix URL này.
  // Ví dụ: axiosClient.post("/auth/login") -> POST http://localhost:5000/api/auth/login
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",

  // timeout: Nếu server không response sau 10 giây, tự động cancel request.
  // Không có timeout -> User có thể ngồi chờ mãi mãi nếu server chết.
  timeout: 10_000,

  headers: {
    "Content-Type": "application/json",
  },
});

// =============================================
// 2. REQUEST INTERCEPTOR — Chạy TRƯỚC khi gửi request
// =============================================
// TỐI ƯU (Junior): Interceptor hoạt động như "middleware" nhưng ở client-side.
// Hình dung: Mỗi request phải đi qua "trạm kiểm soát" này trước khi ra ngoài.
// Tại trạm, ta tự động đính kèm token vào header — không cần copy-paste
// `Authorization: Bearer xxx` trong từng API call riêng lẻ.
axiosClient.interceptors.request.use(
  (config) => {
    // Lấy token từ Zustand store (đã được persist vào localStorage).
    // `getState()` là cách lấy state Zustand bên ngoài React component.
    const token = useAuthStore.getState().token;

    if (token) {
      // Gắn token vào Authorization header — backend dùng để xác thực user.
      // Chuẩn Bearer Token theo RFC 6750.
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config; // Trả config về để request tiếp tục gửi đi
  },
  (error) => {
    // Lỗi khi chuẩn bị request (hiếm xảy ra) — ném tiếp để catch ở component
    return Promise.reject(error);
  },
);

// =============================================
// 3. RESPONSE INTERCEPTOR — Chạy SAU khi nhận response
// =============================================
// TỐI ƯU (Junior): Response interceptor có 2 handler:
//   - Handler 1 (onFulfilled): Chạy khi response thành công (status 2xx).
//     Thường dùng để unwrap data: return response.data thay vì response.
//   - Handler 2 (onRejected): Chạy khi response lỗi (status 4xx, 5xx, network error).
//     Đây là nơi xử lý lỗi toàn cục — 401 tự động logout, 500 hiện thông báo chung.
axiosClient.interceptors.response.use(
  // Handler thành công: Unwrap data để component nhận trực tiếp response.data
  // Thay vì: const res = await axiosClient.get(...); const data = res.data;
  // Ta chỉ cần: const data = await axiosClient.get(...);
  (response) => response.data,

  // Handler lỗi: Xử lý các HTTP error status
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    // 401 Unauthorized: Token hết hạn hoặc không hợp lệ.
    // -> Tự động logout để ép user đăng nhập lại.
    // -> Redirect về /login sẽ do ProtectedRoute xử lý sau khi state cleared.
    if (status === 401) {
      // TỐI ƯU (Junior): Gọi action Zustand từ ngoài component bằng getState().
      // Không thể dùng hook (useAuthStore) ở đây vì đây không phải React component.
      const isLoginEndpoint = error.config?.url?.includes("/auth/login");

      // Không logout nếu chính request login bị 401 (sai password).
      // Chỉ logout khi các request KHÁC bị 401 (token hết hạn).
      if (!isLoginEndpoint) {
        useAuthStore.getState().logout();
        // Redirect về login — window.location thay vì useNavigate vì ở ngoài React
        window.location.href = "/login";
      }
    }

    // Ném lỗi tiếp để component có thể catch và hiển thị message cụ thể
    return Promise.reject(error);
  },
);

export default axiosClient;
