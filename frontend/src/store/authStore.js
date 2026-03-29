// src/store/authStore.js

/**
 * Token nằm trong HTTP-Only Cookie - JS không đọc được
 * Store chỉ lưu 'user' và 'isAuthenticated'
 *
 * Làm sao biết user đã đăng nhập nếu không có token trong store?
 * -> Khi app khởi động, goi API GET /api/auth/profile. Nếu server trả về 200 -> đã login, 401 -> chưa login.
 * Cách chuẩn khi dùng Cookie-based auth.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      // Thông tin user
      user: null,
      // Trạng thái xác thực
      isAuthenticated: false,
      /**
       * Lưu thông tin user sau khi login/register thành công
       * Backend trả user object trong body, token trong cookie
       */
      setCredentials: (user) => set({ user: null, isAuthenticated: true }),
      // Xóa thông tin khi logout
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "vault-auth-storage",
      storage: createJSONStorage(() => localStorage),
      // Chỉ persist user và isAuthenticated, không persist token (ko có)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

export default useAuthStore;
