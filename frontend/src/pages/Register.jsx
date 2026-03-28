// pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { registerApi } from "@/api/authApi";
import useAuthStore from "@/store/authStore";

function Register() {
  const navigate = useNavigate();
  const setCredentials = useAuthStore((state) => state.setCredentials);

  // Form state
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await registerApi({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      console.log(data);

      // Đăng ký xong -> tự động đăng nhập
      setCredentials(data, data.token);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message;

      if (msg?.toLowerCase().includes("email")) {
        setError(
          "Email này đã được đăng ký. Vui lòng dùng email khác hoặc đăng nhập",
        );
      } else {
        setError(
          msg || "Đăng ký thất bại. Vui lòng kiểm tra tra lại thông tin.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
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
          Create account
        </h1>
        <p style={{ fontSize: "0.9375rem", color: "var(--color-ink-2)" }}>
          Start your wealth journey
        </p>
      </div>

      {/* Thông báo lỗi */}
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="label-caps" htmlFor="name">
            Họ và tên
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="input-luxury"
            placeholder="Nguyen Van A"
            value={form.name}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>
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
          <input
            id="password"
            name="password"
            type="password"
            className="input-luxury"
            placeholder="At least 6 characters"
            value={form.password}
            onChange={handleChange}
            minLength={6}
            required
            disabled={isLoading}
          />
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
              Đang tạo tài khoản...
            </>
          ) : (
            "Tạo tài khoản"
          )}
        </button>
      </form>

      <p
        style={{
          textAlign: "center",
          fontSize: "0.9375rem",
          color: "var(--color-ink-2)",
        }}
      >
        Đã có tài khoản{" "}
        <Link
          to="/login"
          style={{
            color: "var(--color-ink)",
            fontWeight: 500,
            textDecoration: "underline",
            textUnderlineOffset: "3px",
            textDecorationColor: "var(--color-gold)",
          }}
        >
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}

export default Register;
