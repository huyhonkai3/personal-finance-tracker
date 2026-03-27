// pages/Login.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setFomr] = useState({ email: "", password: "" });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO ngày 5: Gọi API login + dispatch AuthContext
    console.log("Login:", form);
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
        <p style={{ fontSize: "0.9375rem", color: "var(--color-ink-2" }}>
          Sign in to your account
        </p>
      </div>

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
          />
        </div>

        <div className="space-y-1.5">
          <label className="label-caps" htlmFor="password">
            Password
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
              style={{ paddingRight: "3rem" }}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--color-ink-3)" }}
              onClick={() => setShowPassword((p) => !p)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" className="btn-primary w-full mt-2">
          Sign in
        </button>
      </form>

      {/* Link đến Register */}
      <p style={{ textAlign: 'center', fontSize: '0.9375rem', color: 'var(--color-ink-2)'}}>
        Don't have an account?
        <Link to="/register" style={{color: 'var(--color-ink)', fontWeight: 500, textDecoration: 'underline' textUnderlineOffset: '3px', textDecorationColor: 'var(--color-gold)'}}>Create an account</Link>
      </p>
    </div>
  );
}

export default Login;
