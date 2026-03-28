/**
 * layouts/Sidebar.jsx - Navigation 'Quiet Wealth'
 *
 * Thiết kế: Không phải admin panel. Không background khối màu nặng nề
 * Active state: Chỉ một vệt vàng 2px bên trái + text đậm hơn. Đủ rồi.
 * Cảm hứng: Notion sidebar gặp private banking app.
 */
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  BarChart3,
  Settings,
  LogOut,
  TrendingUp,
  X,
} from "lucide-react";

/**
 * =============== NAVIGATION CONFIG ===============
 *
 * Tách config ra ngoài component thay vì viết JSX lặp lại.
 * Khi cần thêm trang mới, chỉ thêm 1 object vào mảng này - không sờ vào JSX.
 */
const NAV_ITEMS = [
  {
    to: "/dashboard",
    icon: LayoutDashboard,
    label: "Tổng quan",
    // end: true, để chỉ match exact '/dashboard', không match '/dashboard/...'
    end: true,
  },
  {
    to: "/transactions",
    icon: ArrowLeftRight,
    label: "Giao dịch",
  },
  {
    to: "/budgets",
    icon: Target,
    label: "Ngân sách",
  },
  {
    to: "/reports",
    icon: BarChart3,
    label: "Báo cáo",
  },
];

const NAV_BOTTOM = [
  {
    to: "/settings",
    icon: Settings,
    label: "Cài đặt",
  },
];

// ================ SUB-COMPONENTS: NavItem ===============
function NavItem({ to, icon: Icon, label, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className="block"
      style={({ isActive }) => ({
        /**
         * NavLink truyền 'isActive' vào style function
         * Dùng inline style cho CSS variables vì Tailwind không thể conditionally dùng var() trong class string một cách đáng tin cậy.
         */
        textDecoration: "none",
      })}
    >
      {({ isActive }) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.5625rem 0.875rem",
            borderRadius: "0.5rem",
            marginBottom: "1px",
            position: "relative",
            cursor: "pointer",
            // Active: background rất nhạt (5% opacity ink)
            backgroundColor: isActive
              ? "rgba(26, 26, 26, 0.05)"
              : "transparent",
          }}
          className="nav-item-hover"
        >
          {/* Accent bar bên trái - chỉ hiện khi active */}
          {isActive && (
            <div
              style={{
                position: "absolute",
                left: 0,
                top: "20%",
                bottom: "20%",
                width: "2px",
                borderRadius: "0 2px 2px 0",
                backgroundColor: "var(--color-gold)",
              }}
            />
          )}

          {/* Icon */}
          <Icon
            size={16}
            strokeWidth={isActive ? 2.25 : 1.75}
            style={{
              color: isActive ? "var(--color-ink)" : "var(--color-ink-3)",
              flexShrink: 0,
              transition: "color 0.15s ease, stroke-width 0.15s ease",
            }}
          />

          {/* Label */}
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.9rem",
              fontWeight: isActive ? 600 : 400,
              color: isActive ? "var(--color-ink)" : "var(--color-ink-2)",
              letterSpacing: "-0.005em",
              transition: "color 0.15s ease, font-weight 0.1s ease",
            }}
          >
            {label}
          </span>
        </div>
      )}
    </NavLink>
  );
}

/**
 * =============== MAIN SIDEBAR COMPONENT ===============
 *
 * Sidebar nhận onClose prop từ MainLayout
 * Khi use click vào một menu item trên mobile, gọi onClose() để đóng drawer.
 * Pattern này gọi là 'lifting state up' - state sống ở parent (MainLayout).
 * Sidebar chỉ nhận callback để thông báo lên. Không tự quản lý state open/close.`
 */
function Sidebar({ onClose }) {
  return (
    <aside
      style={{
        width: "220px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--color-bg)",
        borderRight: "1px solid var(--color-border)",
        flexShrink: 0,
      }}
    >
      {/* ======== LOGO ======== */}
      <div
        style={{
          padding: "1.375rem 1.25rem 1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          {/* Logo mark: hình vuông nhỏ với icon TrendingUp vàng */}
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "7px",
              backgroundColor: "var(--color-ink)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <TrendingUp size={13} style={{ color: "var(--color-gold)" }} />
          </div>
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.125rem",
              fontWeight: 500,
              color: "var(--color-ink)",
              letterSpacing: "-0.01em",
            }}
          >
            Vault
          </span>
        </div>

        {/* Nút X chỉ hiện trên mobile (parent ẩn sidebar trên desktop) */}
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Đóng menu"
            style={{
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--color-ink-3)",
              padding: "0.25rem",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={17} />
          </button>
        )}
      </div>

      {/* Divider cực mỏng */}
      <div
        style={{
          height: "1px",
          margin: "0 1rem 0.75rem",
          backgroundColor: "var(--color-border)",
          opacity: 0.7,
        }}
      />

      {/* ========= NAVIGATION CHÍNH ============= */}
      <nav
        style={{ flex: 1, padding: "0 0.5rem", overflowY: "auto" }}
        aria-label="Menu điều hướng chính"
      >
        {/* Label section nhỏ - tinh tế như Notion */}
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.625rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-ink-3)",
            marginBottom: "0.375rem",
          }}
        >
          Cá nhân
        </p>

        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.to}
            {...item}
            // Gọi onClose khi click menu item trên mobile -> đóng drawer
            onClick={onClose}
          />
        ))}
      </nav>

      {/* ======== NAVIGATION DƯỚI (Settings + User) =========== */}
      <div style={{ padding: "0.5re 0.5rem 0" }}>
        <div
          style={{
            height: "1px",
            margin: "0 0.375rem 0.5rem",
            backgroundColor: "var(--color-border)",
            opacity: 0.6,
          }}
        />

        {NAV_BOTTOM.map((item) => (
          <NavItem key={item.to} {...item} onClick={onClose} />
        ))}
      </div>

      {/* ========== USER INFO + LOGOUT =========== */}
      <div style={{ padding: "0.5rem 0.875rem 1.25rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            padding: "0.625rem 0",
            borderTop: "1px solid var(--color-border)",
            marginTop: "0.25rem",
            cursor: "pointer",
          }}
        >
          {/* Avatar chữ cái */}
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              backgroundColor: "var(--color-gold-bg, #fdfbf3)",
              border: "1px solid rgba(212, 168, 67, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 600,
                color: "var(--color-gold)",
                fontFamily: "var(--font-sans)",
                letterSpacing: "0.03em",
              }}
            >
              HN
            </span>
          </div>

          {/* Tên + role */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "var(--color-ink)",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Nguyễn Huy
            </p>
            <p
              style={{
                fontSize: "0.625rem",
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-ink-3)",
                marginTop: "1px",
              }}
            >
              Cá nhân
            </p>
          </div>

          {/* Logout icon */}
          <button
            aria-label="Đăng xuất"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--color-ink3)",
              padding: "0.125rem",
              display: "flex",
              borderRadius: "4px",
              transition: "color 0.15s ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--color-expense)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--color-ink-3)")
            }
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>

      {/* Inline style cho hover state của nav items */}
      <style>
        {`.nav-item-hover:hover {
            background-color: rgba(26, 26, 26, 0.04) !important;
          }`}
      </style>
    </aside>
  );
}

export default Sidebar;
