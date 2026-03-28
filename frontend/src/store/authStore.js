/**
 * src/store/authStore.js - Zustand Auth Store
 *
 * Lưu trữ thông tin đăng nhập user.
 * Middleware 'persist' tự động sync state xuống localStorage.
 * -> User F5 trang vẫn còn đăng nhập, không bị mất session.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useAuthStore = create(
  /**
   * Bọc store trong 'persist()' middleware.
   * Zustand sẽ tự động:
   * 1. Đọc state từ localStorage khi app khởi động (rehydrate)
   * 2. Ghi state xuống localStorage mỗi khi state thay đổi -> không cần tự viết localStorage.setItem/getItem ở khắp nơi.
   */
  persist(
    (set, get) => ({
      // STATE
      /** Thông tin user sau khi đăng nhập. null nếu chưa đăng nhập. */
      user: null,
      /** JWT Access Token. null nếu chưa đăng nhập */
      token: null,

      // ACTION

      /**
       * Lưu thông tin đăng nhập sau khi login/register thành công.
       * @param {Object} user - Thông tin user từ API response
       * @param {string} token - JWT Access Token từ API response
       */
      setCredentials: (user, token) => set({ user, token }),

      /**
       * Đăng xuất: Xóa toàn bộ khỏi store và localStorage.
       * Được gọi từ Sidebar logout và Axios interceptor (khi nhận 401).
       */
      logout: () => set({ user: null, token: null }),

      // COMPUTED
      /** true nếu có cả token lẫn user object */
      isAuthenticated: () => {
        const { token, user } = get();
        return !!(token && user);
      },
    }),
    {
      // 'name' là key trong localStorage
      // Đặt prefix tên app để tránh conflict khi nhiều app chạy cùng localhost.
      name: "vault-auth-storage",

      storage: createJSONStorage(() => localStorage),

      // 'partialize' - chỉ persist các field cần thiết.
      // Actions (function) không cần lưu, chỉ lưu data.
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    },
  ),
);

export default useAuthStore;
