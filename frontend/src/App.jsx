/**
 * App.jsx - Router & Router Structure
 *
 * Tách cấu trúc route ra 3 tầng rõ ràng:
 * 1. PublicRoute -> Chỉ cho user Chưa đăng nhập (Login, Register)
 * 2. PrivateRoute -> Chỉ cho user Đã đăng nhập (Dashboard, Profile)
 * 3. Layout components -> Bọc các trang cùng layout (sidebar, navbar,...)
 */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import MainLayout from "@/layouts/MainLayout";
import AuthLayout from "@/layouts/AuthLayout";

// Pages
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

// ========== Route Guards =============

// PublicRoute: Chỉ dành cho user chưa đăng nhập
const PublicRoute = ({ children }) => {
  // Thay bằng useAuth() hook sau khi implement AuthContext
  const isAuthenticated = false; // Placeholder
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

// PrivateRoute: Chỉ dành cho user đã đăng nhập
const PrivateRoute = ({ children }) => {
  const isAuthenticated = true; // Placeholder
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// =============== App Component - Route Tree ========================
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ====== Auth Routes (Không có sidebar/navbar chính) =========== */}
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

        {/* ======== App Routes (Có sidebar, navbar) =========*/}
        <Route
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboar />} />
        </Route>

        {/* Fallback Routes */}
        {/* Về dashboard nếu đã login, login nếu chưa */}
        <Route path='/' element{<Navigate to='/dashboard' replace />} />
        {/* 404: Bất kỳ path nào không khớp -> về Dashboard */}
        <Route path="*" element{<Navigate to="/dashboar" replace /> } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
