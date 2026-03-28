// pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { loginApi } from "@/api/authApi";
import useAuthStore from "@/store/authStore";

function Login() {
  const navigate = useNavigate();
  const setCredentials = useAuthStore((state) => state.setCredentials);

  // Form states
  const [form, setForm] = useState({ email: "", password: "" });

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(""); // Thông báo lỗi tiếng việt

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset lỗi cũ mỗi lần submit mới
    setError("");
    setIsLoading(true);

    try {
      // Gọi API login - axiosClient interceptor tự unwrap response.data
      const data = await loginApi({
        email: form.email,
        password: form.password,
      });
      // Lưu user và token vào Zustand store (và localStorage qua persist)
      setCredentials(data, data.token);
      // Chuyển về dashboard
      navigate("/dashboard", { replace: true });
    } catch (err) {
      // Ưu tiên message từ backend, fallback về generic
      const msg = err?.response?.data?.message;

      setError(
        msg === "Email hoặc mật khẩu không đúng"
          ? "Email hoặc mật khẩu không đúng. Vui lòng thử lại"
          : msg || "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="space-y-1">
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.875rem",
            fontWeight: 500,
            color: "var(--color-ink)",
            letterSpacing: "-0.02em",
          }}
        >
          Welcome back
        </h1>
        <p style={{ fontSize: "0.9375rem", color: "var(--color-ink-2)" }}>
          Sign in to your account
        </p>
      </div>

      {/* Thông báo lỗi - chỉ hiện khi có lỗi */}
      {error && (
        <div
          role="alert"
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "0.625rem",
            backgroundColor: "var(--color-expense-bg)",
            border: "1px solid rgba(139, 74, 58, 0.2)",
            fontSize: "0.875rem",
            color: "var(--color-expense)",
            lineHeight: 1.5,
          }}
        >
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="label-caps" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="input-luxury"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-1.5">
          <label className="label-caps" htmlFor="password">
            Mật khẩu
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              className="input-luxury"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              style={{ paddingRight: "3rem" }}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--color-ink-3)" }}
              onClick={() => setShowPassword((p) => !p)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary w-full mt-2"
          disabled={isLoading}
          style={
            isLoading ? { opacity: 0.75, cursor: "not-allowed" } : undefined
          }
        >
          {isLoading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Đang đăng nhập...
            </>
          ) : (
            "Đăng nhập"
          )}
        </button>
      </form>

      {/* Link đến Register */}
      <p
        style={{
          textAlign: "center",
          fontSize: "0.9375rem",
          color: "var(--color-ink-2)",
        }}
      >
        Chưa có tài khoản?{" "}
        <Link
          to="/register"
          style={{
            color: "var(--color-ink)",
            fontWeight: 500,
            textDecoration: "underline",
            textUnderlineOffset: "3px",
            textDecorationColor: "var(--color-gold)",
          }}
        >
          Tạo tài khoản
        </Link>
      </p>
    </div>
  );
}

export default Login;
