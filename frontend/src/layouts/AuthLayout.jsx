// layouts/AuthLayout.jsx
import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: "var(--color-bg" }}
    >
      {/* ========= Cột trái: Brand Statement (chỉ desktop) =========== */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between p-16 relative overflow-hidden"
        style={{ backgroundColor: "var(--color-ink)", color: "var(--color-bg" }}
      >
        {/* Subtle noise texture */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.5rem",
              fontWeight: 500,
            }}
          >
            Vault
          </span>
        </div>

        {/* Brand statement */}
        <div className="relative z-10 space-y-8">
          <p
            className="label-caps"
            style={{ color: "var(--color-ink-3", opacity: 0.5 }}
          >
            Wealth Intelligence
          </p>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "4.25rem",
              lineHeight: 1.05,
              fontWeight: 500,
              letterSpacing: "-0.03em",
              color: "var(--color-bg)",
            }}
          >
            Know where
            <br />
            every coin
            <br />
            <em style={{ fontStyle: "italic", color: "var(--color-gold)" }}>
              belongs.
            </em>
          </h1>
          <p
            style={{
              color: "var(--color-ink-3",
              opacity: 0.6,
              maxWidth: "18rem",
              lineHeight: 1.6,
            }}
          >
            Quiet clarity for those who take their financial future seriously.
          </p>
        </div>

        {/* Footer mark */}
        <div className="relative z-10">
          <div
            className="w-12 h-px mb-5"
            style={{ backgroundColor: "var(--color-gold", opacity: 0.5 }}
          />
          <p
            style={{
              color: "var(--color-ink-3",
              fontSize: "0.8125rem",
              opacity: 0.35,
            }}
          >
            © 2026 Vault. Private Wealth Tracker.
          </p>
        </div>
      </div>

      {/* ======== Cột phải: Form =========== */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-sm">
          {/* Logo mobile only */}
          <div className="lg:hidden mb-12 text-center">
            <span
              style={{
                fontFamily: "var(--font-serif",
                fontSize: "1.75rem",
                fontWeight: 500,
              }}
            >
              Vault
            </span>
          </div>
          {/* Outlet: Nơi React Router render Login hoặc Register */}
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
