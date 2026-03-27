// =============================================
// App.jsx - Router & Route Structure
// =============================================
// TỐI ƯU (Junior): Tách cấu trúc route ra 3 tầng rõ ràng:
//   1. PublicRoute  -> Chỉ cho user CHƯA đăng nhập (Login, Register)
//      Nếu đã đăng nhập -> redirect về Dashboard
//   2. PrivateRoute -> Chỉ cho user ĐÃ đăng nhập
//      Nếu chưa đăng nhập -> redirect về Login
//   3. Layout components -> Bọc các trang cùng layout (sidebar, navbar, v.v.)

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import MainLayout from "@/layouts/MainLayout";
import AuthLayout from "@/layouts/AuthLayout";

// Pages
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import TestUI from "@/pages/TestUI";

// =============================================
// Route Guards
// =============================================

/**
 * PublicRoute: Chỉ dành cho user chưa đăng nhập.
 * Nếu đã đăng nhập -> redirect về Dashboard.
 * Ví dụ: Vào trang Login khi đã login -> không có ý nghĩa, redirect ngay
 */
const PublicRoute = ({ children }) => {
  // TODO: Thay bằng useAuth() hook sau khi implement AuthContext (Ngày 5)
  const isAuthenticated = false; // Placeholder
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

/**
 * PrivateRoute: Chỉ dành cho user đã đăng nhập.
 * Nếu chưa đăng nhập -> redirect về trang Login.
 * `replace`: Thay thế history entry hiện tại thay vì push mới
 *   -> User nhấn Back từ Login sẽ không quay lại trang protected
 */
const PrivateRoute = ({ children }) => {
  // TODO: Thay bằng useAuth() hook sau khi implement AuthContext (Ngày 5)
  const isAuthenticated = true; // Placeholder - tạm cho là đã đăng nhập để xem Dashboard
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// =============================================
// App Component - Route Tree
// =============================================
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ===== Auth Routes (Không có sidebar/navbar chính) ===== */}
        <Route
          element={
            <PublicRoute>
              <AuthLayout />
            </PublicRoute>
          }
        >
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* ===== App Routes (Có sidebar, navbar) ===== */}
        <Route
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/test-ui" element={<TestUI />} />
        </Route>

        {/* ===== Fallback Routes ===== */}
        {/* Root "/" -> redirect về Dashboard nếu đã login, Login nếu chưa */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        {/* 404: Bất kỳ path không khớp -> về Dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
