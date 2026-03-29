// =============================================
// src/App.jsx — Fix: BrowserRouter phải bọc toàn bộ kể cả loading state
// =============================================

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import MainLayout from "@/layouts/MainLayout";
import AuthLayout from "@/layouts/AuthLayout";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import TestUI from "@/pages/TestUI";
import ProtectedRoute from "@/components/ProtectedRoute";

import useAuthStore from "@/store/authStore";
import { getMeApi } from "@/api/authApi";

// =============================================
// PublicRoute
// =============================================
const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

// =============================================
// AppRoutes — tách ra để dùng hooks của React Router bên trong BrowserRouter
// =============================================
function AppRoutes() {
  const [isVerifying, setIsVerifying] = useState(true);

  const setCredentials = useAuthStore((state) => state.setCredentials);
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    const verifySession = async () => {
      // Nếu store báo chưa đăng nhập -> không cần verify
      if (!isAuthenticated) {
        setIsVerifying(false);
        return;
      }

      try {
        // Gọi GET /api/auth/profile — cookie tự gửi kèm nhờ withCredentials
        const data = await getMeApi();
        setCredentials(data);
      } catch {
        // Cookie hết hạn -> logout, ProtectedRoute sẽ redirect về /login
        logout();
      } finally {
        setIsVerifying(false);
      }
    };

    verifySession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Loading spinner — nằm BÊN TRONG BrowserRouter nên MainLayout vẫn có context
  if (isVerifying) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--color-bg, #FAF9F7)",
        }}
      >
        <div
          style={{
            width: "20px",
            height: "20px",
            border: "2px solid var(--color-border, #E8E4DD)",
            borderTopColor: "var(--color-gold, #D4A843)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
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

      {/* ===== Protected Routes ===== */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/test-ui" element={<TestUI />} />
          {/* TODO: thêm các trang khác vào đây */}
        </Route>
      </Route>

      {/* ===== Fallback ===== */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

// =============================================
// App — BrowserRouter bọc toàn bộ, kể cả loading state
// =============================================
function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
