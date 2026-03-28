// src/components/ProtectedRoute.jsx
/**
 * Bảo vệ các trang cần đăng nhập
 * Nếu chưa có token/user trong Zustand store -> redirect về /login
 * Dùng trong App.jsx thay thế cho PrivateRoute placeholder cũ.
 */
import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "@/store/authStore";

/**
 * Dùng <Outlet /> thay vì nhận 'children' prop.
 * Outlet là cách React Router v6 render các route con lồng nhau.
 * Cách này cho phép bọc nhiều route cùng lúc mà không cần wrap từng cái.
 */
function ProtectedRoute() {
  // Lấy token từ Zustand - đã được persist nên vẫn còn sau khi F5
  const token = useAuthStore((state) => state.token);

  // 'replace' Thay thế history entry hiện tại, tránh user nhấn Back quay lại trang protected
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Có token -> render các trang con (Dashboard, Transactions,...)
  return <Outlet />;
}

export default ProtectedRoute;
