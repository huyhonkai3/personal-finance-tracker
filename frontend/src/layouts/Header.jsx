// =============================================
// layouts/Header.jsx — Topbar "Quiet Wealth"
// =============================================
// Thiết kế: Thanh mảnh, không chiếm diện tích. Khi cuộn trang,
// background blur nhẹ để nổi trên content nhưng không che khuất.
// Mobile: Hamburger bên trái, logo giữa — giống app banking cao cấp.

import { useLocation } from "react-router-dom";
import { Menu, Bell, ChevronDown, Search } from "lucide-react";

// =============================================
// MAP: path -> tên trang hiển thị trên Header
// =============================================
// TỐI ƯU (Junior): Tách mapping này ra để dễ thêm trang mới.
// Alternative: Dùng useMatches() của RR6 để lấy breadcrumb, nhưng
// approach này đơn giản hơn và đủ dùng cho Fresher.
const PAGE_TITLES = {
  "/dashboard": "Tổng quan",
  "/transactions": "Giao dịch",
  "/budgets": "Ngân sách",
  "/reports": "Báo cáo",
  "/settings": "Cài đặt",
  "/test-ui": "Test UI",
};

// =============================================
// SUB-COMPONENT: NotificationBell
// =============================================
function NotificationBell({ count = 0 }) {
  return (
    <button
      aria-label={`Thông báo${count > 0 ? ` (${count} mới)` : ""}`}
      style={{
        position: "relative",
        background: "transparent",
        border: "1px solid var(--color-border)",
        borderRadius: "8px",
        width: "34px",
        height: "34px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: "var(--color-ink-2)",
        transition: "all 0.15s ease",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--color-ink-3)";
        e.currentTarget.style.color = "var(--color-ink)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--color-border)";
        e.currentTarget.style.color = "var(--color-ink-2)";
      }}
    >
      <Bell size={15} strokeWidth={1.75} />
      {/* Badge số thông báo */}
      {count > 0 && (
        <span
          style={{
            position: "absolute",
            top: "-4px",
            right: "-4px",
            minWidth: "16px",
            height: "16px",
            borderRadius: "9999px",
            backgroundColor: "var(--color-gold)",
            color: "var(--color-ink)",
            fontSize: "0.5625rem",
            fontWeight: 700,
            fontFamily: "var(--font-sans)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 3px",
            lineHeight: 1,
            border: "1.5px solid var(--color-bg)",
          }}
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}

// =============================================
// MAIN HEADER COMPONENT
// =============================================
// TỐI ƯU (Junior): Header nhận `onMenuToggle` prop từ MainLayout.
// Khi user bấm nút Hamburger, Header KHÔNG tự xử lý việc show/hide Sidebar —
// nó chỉ gọi callback lên parent (MainLayout) để parent quyết định.
// Pattern: Child component không tự quản lý state của sibling (Sidebar).
// MainLayout là "controller" duy nhất biết trạng thái drawer.
function Header({ onMenuToggle }) {
  const location = useLocation();

  // Lấy tên trang từ map, fallback về "Vault" nếu không có
  const pageTitle = PAGE_TITLES[location.pathname] ?? "Vault";

  return (
    <header
      style={{
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        padding: "0 1.25rem",
        borderBottom: "1px solid var(--color-border)",
        backgroundColor: "var(--color-bg)",
        // Sticky với backdrop-blur khi cuộn — cảm giác "floating" thanh lịch
        position: "sticky",
        top: 0,
        zIndex: 20,
        // backdrop-filter chỉ hoạt động khi bg có transparency
        // Giữ bg solid cho đơn giản, có thể nâng cấp thành rgba sau
        flexShrink: 0,
      }}
    >
      {/* ===== LEFT: Hamburger (mobile) + Tên trang ===== */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {/* Hamburger — chỉ hiện trên mobile (lg: ẩn qua CSS class) */}
        <button
          onClick={onMenuToggle}
          aria-label="Mở menu điều hướng"
          className="lg-hidden-hamburger"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--color-ink-2)",
            padding: "0.25rem",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            transition: "color 0.15s ease",
            // Hiển thị trên mobile, ẩn trên desktop
            // Dùng class + style tag ở dưới để handle responsive
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--color-ink)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--color-ink-2)")
          }
        >
          <Menu size={20} strokeWidth={1.75} />
        </button>

        {/* Tên trang hiện tại */}
        <div>
          <h1
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.9375rem",
              fontWeight: 600,
              color: "var(--color-ink)",
              letterSpacing: "-0.01em",
              lineHeight: 1,
            }}
          >
            {pageTitle}
          </h1>
          {/* Breadcrumb nhỏ phía dưới — subtle context */}
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.625rem",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-ink-3)",
              marginTop: "2px",
              lineHeight: 1,
            }}
          >
            Tháng Sáu, 2025
          </p>
        </div>
      </div>

      {/* ===== RIGHT: Search + Bell + User ===== */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {/* Search button — chỉ icon trên mobile, có thể expand sau */}
        <button
          aria-label="Tìm kiếm"
          style={{
            background: "transparent",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            width: "34px",
            height: "34px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--color-ink-2)",
            transition: "all 0.15s ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--color-ink-3)";
            e.currentTarget.style.color = "var(--color-ink)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--color-border)";
            e.currentTarget.style.color = "var(--color-ink-2)";
          }}
        >
          <Search size={14} strokeWidth={1.75} />
        </button>

        {/* Notification Bell với 3 thông báo mẫu */}
        <NotificationBell count={3} />

        {/* User Avatar Button */}
        <button
          aria-label="Menu người dùng"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "transparent",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            padding: "0.3125rem 0.5rem 0.3125rem 0.375rem",
            cursor: "pointer",
            transition: "all 0.15s ease",
            height: "34px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--color-ink-3)";
            e.currentTarget.style.backgroundColor = "var(--color-bg-subtle)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--color-border)";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          {/* Mini avatar */}
          <div
            style={{
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              backgroundColor: "var(--color-gold-bg, #FDFBF3)",
              border: "1px solid rgba(212,168,67,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: "0.5625rem",
                fontWeight: 700,
                color: "var(--color-gold)",
                fontFamily: "var(--font-sans)",
                letterSpacing: "0.02em",
              }}
            >
              HN
            </span>
          </div>
          {/* Tên — ẩn trên mobile nhỏ */}
          <span
            className="header-username"
            style={{
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: "var(--color-ink)",
              fontFamily: "var(--font-sans)",
              letterSpacing: "-0.005em",
            }}
          >
            Huy
          </span>
          <ChevronDown size={12} style={{ color: "var(--color-ink-3)" }} />
        </button>
      </div>

      {/* ===== Responsive CSS ===== */}
      <style>{`
        /* Desktop: ẩn hamburger */
        @media (min-width: 1024px) {
          .lg-hidden-hamburger {
            display: none !important;
          }
        }
        /* Mobile nhỏ: ẩn username trong header để tiết kiệm chỗ */
        @media (max-width: 480px) {
          .header-username {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}

export default Header;
