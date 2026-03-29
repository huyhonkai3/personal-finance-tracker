// src/components/ProtectedRoute.jsx
/**
 * Kiểm tra 'isAuthenticated' - được set sau khi verify cookie thành công qua API /auth/profile khi app khởi động
 */
import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "@/store/authStore";

function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

export default ProtectedRoute;
