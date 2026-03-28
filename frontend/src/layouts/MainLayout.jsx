// =============================================
// layouts/MainLayout.jsx — Bộ khung layout chính
// =============================================
// Đây là "controller" của toàn bộ layout:
//   - Quản lý state isMobileMenuOpen
//   - Phân phối state + callback xuống Header và Sidebar
//   - Xử lý responsive: desktop (sidebar cố định) vs mobile (drawer)
// <Outlet /> là nơi React Router render các trang con (Dashboard, Transactions, ...)

import { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

// =============================================
// CONSTANTS
// =============================================
const SIDEBAR_WIDTH = "220px";
const HEADER_HEIGHT = "56px";

// =============================================
// MAIN LAYOUT COMPONENT
// =============================================
function MainLayout() {
  // TỐI ƯU (Junior): State isMobileMenuOpen sống ở đây — parent duy nhất
  // biết trạng thái của drawer. Cả Header (toggle) và Sidebar (close)
  // đều nhận callback từ đây để thay đổi state này.
  // Nếu để state trong Sidebar: Header sẽ không biết Sidebar đang open/close.
  // Nếu để state trong Header: Sidebar sẽ không biết khi nào cần tự đóng.
  // -> Giải pháp: "Lift state up" lên component cha chung (MainLayout).
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const location = useLocation();

  // =============================================
  // TỐI ƯU (Junior): useCallback để tránh tạo function mới mỗi lần render.
  // Nếu không có useCallback, Header và Sidebar sẽ re-render mỗi lần
  // MainLayout render (dù các props khác không thay đổi).
  // Kết hợp với React.memo (nếu cần sau này) cho performance tốt hơn.
  // =============================================
  const handleMenuToggle = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const handleMenuClose = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // TỐI ƯU (Junior): Tự động đóng drawer khi user navigate sang trang mới.
  // Nếu không có effect này: User bấm "Giao dịch" -> trang thay đổi nhưng
  // drawer vẫn mở che mất content. UX rất tệ.
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // TỐI ƯU (Junior): Đóng drawer khi nhấn Escape — accessibility standard.
  // Screen reader và keyboard navigation users cần có cách thoát modal/drawer.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  // TỐI ƯU (Junior): Khóa scroll của body khi drawer mở trên mobile.
  // Nếu không lock: user có thể scroll trang phía sau overlay — rất confusing.
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    // Cleanup khi component unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "var(--color-bg)",
      }}
    >
      {/* =============================================
          DESKTOP SIDEBAR — hiển thị cố định bên trái
          Ẩn hoàn toàn trên mobile (<1024px) qua CSS
          ============================================= */}
      <div className="desktop-sidebar-wrapper">
        <div
          style={{
            width: SIDEBAR_WIDTH,
            height: "100vh",
            position: "sticky",
            top: 0,
            // Sidebar không scroll theo trang — content bên phải scroll
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {/* Desktop: không truyền onClose vì không cần nút X */}
          <Sidebar onClose={null} />
        </div>
      </div>

      {/* =============================================
          MOBILE DRAWER — slide từ trái khi mở
          ============================================= */}
      {/* Overlay mờ — tap để đóng */}
      <div
        aria-hidden="true"
        onClick={handleMenuClose}
        className="mobile-overlay"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          // Transition fade-in/out cho overlay
          opacity: isMobileMenuOpen ? 1 : 0,
          pointerEvents: isMobileMenuOpen ? "auto" : "none",
          transition: "opacity 0.25s ease",
          // Chỉ hiện trên mobile
          display: "none",
        }}
      />

      {/* Drawer panel — slide in từ bên trái */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu điều hướng"
        className="mobile-drawer"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: SIDEBAR_WIDTH,
          zIndex: 50,
          // Slide animation: dùng transform thay vì left/margin
          // transform GPU-accelerated -> animation mượt hơn nhiều
          transform: isMobileMenuOpen
            ? "translateX(0)"
            : `translateX(-${SIDEBAR_WIDTH})`,
          transition: "transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          // Chỉ hiện trên mobile
          display: "none",
          // Shadow đẹp khi drawer mở
          boxShadow: isMobileMenuOpen
            ? "4px 0 24px rgba(0,0,0,0.12), 1px 0 0 rgba(0,0,0,0.06)"
            : "none",
        }}
      >
        {/* Mobile: truyền onClose để có nút X trong Sidebar */}
        <Sidebar onClose={handleMenuClose} />
      </div>

      {/* =============================================
          MAIN CONTENT AREA (Header + Page)
          ============================================= */}
      <div
        style={{
          flex: 1,
          minWidth: 0, // Quan trọng: ngăn flex child overflowing
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header sticky — nhận callback để toggle mobile drawer */}
        <Header onMenuToggle={handleMenuToggle} />

        {/* Page content — <Outlet /> render trang con từ React Router */}
        <main
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* =============================================
          RESPONSIVE CSS
          Dùng style tag thay vì Tailwind breakpoint class
          để tránh conflict với inline styles và đảm bảo
          specificity rõ ràng.
          ============================================= */}
      <style>{`
        /* Desktop (≥1024px): Hiện sidebar cố định, ẩn mobile elements */
        @media (min-width: 1024px) {
          .desktop-sidebar-wrapper {
            display: flex !important;
          }
          .mobile-overlay,
          .mobile-drawer {
            display: none !important;
          }
        }

        /* Mobile/Tablet (<1024px): Ẩn desktop sidebar, hiện mobile elements */
        @media (max-width: 1023px) {
          .desktop-sidebar-wrapper {
            display: none !important;
          }
          .mobile-overlay {
            display: block !important;
          }
          .mobile-drawer {
            display: block !important;
          }
        }

        /* Ngăn scroll ngang khi drawer đang slide */
        html {
          overflow-x: hidden;
        }
      `}</style>
    </div>
  );
}

export default MainLayout;
