/**
 * layouts/MainLayout.jsx - Layout chính với Sidebar
 *
 * Layout dùng CSS Grid để sidebar và main content
 * không phụ thuộc nhau về chiều cao. Sidebar luôn full height.
 */
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Target,
  Settings,
  LogOut,
  TrendingUp,
} from "lucide-react";

// Danh sách navigation items - tách ra để dễ thêm/xóa
const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { to: "/transactions", icon: ArrowLeftRight, label: "Transactions" },
  { to: "/budget", icon: Target, label: "Budget" },
  { to: "/analytics", icon: PieChart, label: "Analytics" },
];

function Sidebar() {
  return (
    <aside
      className="hidden md:flex flex-col h-screen sticky top-0 w-[240px] border-r"
      style={{
        backgroundColor: "var(--color-bg)",
        borderColor: "var(--color-border",
      }}
    >
      {/* Logo */}
      <div className="px-6 py-7 flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "var(--color-ink)" }}
        >
          <TrendingUp size={14} style={{ color: "var(--color-gold" }} />
        </div>
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.1875rem",
            fontWeight: 500,
            color: "var(--color-ink)",
          }}
        >
          Vault
        </span>
      </div>

      <div
        className="h-px mx-4"
        style={{ backgroundColor: "var(--color-border)" }}
      />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150
              ${isActive ? "text-[var(--color-ink)]" : "text-[var(--color-ink-2)] hover:text-[var(--color-ink)]"}`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive
                ? "var(--color-bg-subtle)"
                : "transparent",
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={16} strokeWith={isActive ? 2 : 1.5} />
                <span
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: isActive ? 500 : 400,
                  }}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: User + Logout */}
      <div className="p-4 space-y-1">
        <div
          className="h-px mb-3"
          style={{ backgroundColor: "var(--color-border)" }}
        />
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150"
          style={{ color: "var(--color-ink-2)" }}
        >
          <Settings size={16} strokeWith={1.5} />
          <span style={{ fontSize: "0.9375rem" }}>Settings</span>
        </NavLink>
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150"
          style={{ color: "var(--color-ink-2)" }}
          onClick={() => {
            /* dispatch logout */
          }}
        >
          <LogOut size={16} strokeWith={1.5} />
          <span style={{ fontSize: "0.9375rem" }}>Logout</span>
        </button>

        {/* User Avatar */}
        <div
          className="flex items-center gap-3 px-3 pt-3 mt-1 border-t"
          style={{ borderColor: "var(--color-border" }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
            style={{
              backgroundColor: "var(--color-gold-light, #f3e4a0)",
              color: "var(--color-ink)",
            }}
          >
            HN
          </div>
          <div className="flex-1 min-w-0">
            <p
              style={{
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "var(--color-ink)",
              }}
              className="truncate"
            >
              Huy Nguyen
            </p>
            <p className="label-caps truncate">Personal</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function MainLayout() {
  return (
    /**
     * Dùng CSS Grid `grid-cols-[auto_1fr] thay vì flexbox
     * Grid tự động tính kích thước cột theo nội dung Sidebar
     * `overflow-hidden` trên container + `overflow-y-auto` trên main
     * để sidebar sticky hoạt động đúng và main scrollable riêng biệt
     */
    <div
      className="flex min-h-screen"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 min-w-0">
        {/* Outlet: Nơi render trang con (Dashboard, Transaction,...) */}
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
