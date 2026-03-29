// =============================================
// App.jsx - Router & Route Structure
// =============================================

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  replace,
} from "react-router-dom";
import { useEffect, useState } from "react";

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
import { getMeApi } from "@/api/authApi";

// =============================================
// Route Guards
// =============================================
const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

// =============================================
// App Component - Route Tree
// =============================================
function App() {
  // isVerifying: true trong lúc đang gọi API check cookie
  // Tránh flash redirect về /login trước khi biết cookie còn hợp lệ không
  const [isVerifying, setIsVerifyIng] = useState(true);

  const setCredentials = useAuthStore((state) => state.setCredentials);
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    const verifySession = async () => {
      // Nếu store nói chưa đăng nhập -> không cần verify, skip
      if (!isAuthenticated) {
        setIsVerifyIng(false);
        return;
      }

      try {
        const data = await getMeApi();
        setCredentials(data);
      } catch {
        // cookie hết hạn hoặc không hợp lệ
        logout();
      } finally {
        setIsVerifyIng(false);
      }
    };
    verifySession();
  }, []);

  // Hiển thị màn hình trắng/loading trong lúc verify
  // Tránh flash: user vào /dashboard -> redirect /login -> redirect /dashboard
  if (isVerifying) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--color-bg, #faf9f7)",
        }}
      >
        {/* Spinner nhỏ, không gây distraction */}
        <div
          style={{
            width: "20px",
            height: "20px",
            border: "2px solid var(--color-border, #e8e4dd)",
            borderTopColor: "var(--color-gold, #d4a843)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

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
