// =============================================
// App.jsx - Router & Route Structure
// =============================================

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import MainLayout from "@/layouts/MainLayout";
import AuthLayout from "@/layouts/AuthLayout";

// Pages
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import TestUI from "@/pages/TestUI";

// ProtectedRoute
import ProtectedRoute from "@/components/ProtectedRoute";

import useAuthStore from "@/store/authStore";

// =============================================
// Route Guards
// =============================================
const PublicRoute = ({ children }) => {
  const token = useAuthStore((state) => state.token);
  return token ? <Navigate to="/dashboard" replace /> : children;
};

// =============================================
// App Component - Route Tree
// =============================================
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ===== Auth Routes ===== */}
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

        {/* ===== App Routes — bọc trong MainLayout mới ===== */}
        {/*
          Cấu trúc sau khi render:
            <PrivateRoute>
              <MainLayout>          ← Sidebar + Header
                <Outlet />          ← Nơi Dashboard / TestUI được render
              </MainLayout>
            </PrivateRoute>

          TỐI ƯU (Junior): Mọi trang cần layout chính (sidebar, header)
          đều đặt làm Route con của Route có element={<MainLayout />}.
          Thêm trang mới chỉ cần thêm <Route> con — không cần sửa MainLayout.
        */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/test-ui" element={<TestUI />} />
        </Route>

        {/* ===== Fallback Routes ===== */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
