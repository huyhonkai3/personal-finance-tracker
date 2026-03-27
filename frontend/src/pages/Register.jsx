// pages/Register.jsx
import { useState } from "react";
import { Link } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO ngày 5: Gọi API register + auto-login
    console.log("Register: ", form);
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="label-caps" htmlFor="name">
            Full Name
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
          />
        </div>
        <div className="space-y-1.5">
          <label className="label-caps" htmlFor="password">
            Password
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
          />
        </div>
        <button type="submit" className="btn-primary w-full mt-2">
          Create account
        </button>
      </form>

      <p
        style={{
          textAlign: "center",
          fontSize: "0.9375rem",
          color: "var(--color-ink-2)",
        }}
      >
        Already have an account?{" "}
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
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default Register;
