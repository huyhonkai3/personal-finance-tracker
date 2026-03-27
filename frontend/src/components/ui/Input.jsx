/**
 * components/ui/Input.jsx
 * Design: Tối giản đến mức tối đa. Padding rộng. Không có border thừa.
 * Nguyên tắc: Input nên 'biến mất' - user tập trung vào nội dung họ nhập,
 * không phải vào các ô nhập. Focus state mới là lúc nó thể hiện mình.
 */
import { forwardRef, useId } from "react";
import { AlertCircle, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useState } from "react";

// ============= STYLES ================
const INPUT_BASE = [
  "w-full",
  "bg-[var(--color-bg-subtle)]",
  // Border thống nhất tất cả 4 cạnh -subtle, không aggressive
  "border border-[var(--color-border)]",
  "text-[var(--color-ink)]",
  "font-sans text-[0.9375rem]",
  "placeholder:text-[var(--color-ink-3)]",
  // Loại bỏ outline mặc định của browser - xấu và không theo design system
  "outline-none",
  // Transition mượt cho focus/error state
  "transition-all duration-200",
  // Disabled style
  "disabled:opacity-50 disabled:cursor-not-allowed",
].join(" ");

// State-based border styles - áp dụng theo props
const INPUT_STATE = {
  default: [
    "rounded-[8px] px-4 py-3",
    "focus:border-[var(--color-gold)]",
    "focus:bg-[var(--color-bg-card)]",
    // Ring mờ quanh input khi focus - không xanh mặc định của browser
    "focus:shadow-[0_0_0_3px_rgba(212,168,67,0.12)]",
  ].join(" "),

  error: [
    "rounded-[8px] px-4 py-3",
    "border-[var(--color-expense)] bg-[var(--color-expense-bg)]",
    "focus:border-[var(--color-expense)]",
    "focus:shadow-[0_0_0_3px_rgba(139,74,58,0.1]",
  ].join(" "),

  success: [
    "rounded-[8px] px-4 py-3",
    "border-[var(--color-income)]",
    "focus:border-[var(--color-income)]",
    "focus:shadow-[0_0_0_3px_rgba(61,107,90,0.1)]",
  ].join(" "),
};

// ============= SUB-COMPONENT: Label ===============
function InputLabel({ htmlFor, required, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block"
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: "0.6875rem",
        fontWeight: 500,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--color-ink-2)",
        marginBottom: "0.375rem",
      }}
    >
      {children}
      {/* Dấu * cho required field - dùng gold thay vì đỏ mặc định */}
      {required && (
        <span style={{ color: "var(--color-gold)", marginLeft: "0.25rem" }}>
          *
        </span>
      )}
    </label>
  );
}

/**
 * ================ MAIN COMPONENT ===================
 * Dùng forwardRef để form libraries (React Hook Form, Formik)
 * có thể gắn ref vào <input> bên trong để register field và handle validation.
 * Không có forwardRef: ref sẽ trở vào component wrapper, không phải DOM input
 * -> React Hook Form sẽ không thể focus vào input khi có lỗi.
 */
const Input = forwardRef(function Input(
  {
    label,
    error,
    success,
    hint,
    id,
    required,
    type = "text",
    className = "",
    wrapperClassName = "",
    ...rest
  },
  ref,
) {
  // useId() tự sinh ID unique, đảm bảo label htmlFor khớp với input id
  // Tránh hard-code id dạng "email-input" dễ bị trùng khi dùng component nhiều lần trên 1 trang
  // Ví dụ: Trang có 2 form login và register cùng lúc -> sẽ bị trùng id
  const generatedId = useId();
  const inputId = id ?? generatedId;

  // State cho password show/hide toggle
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword ? (showPwd ? "text" : "password") : type;

  // Xác định state hiển thị
  const stateKey = error ? "error" : success ? "success" : "default";
  const stateClass = INPUT_STATE[stateKey];

  return (
    <div className={`w-full ${wrapperClassName}`}>
      {/* Label */}
      {label && (
        <InputLabel htmlFor={inputId} required={required}>
          {label}
        </InputLabel>
      )}

      {/* Input wrapper — relative để đặt icon tuyệt đối bên trong */}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={resolvedType}
          required={required}
          // TỐI ƯU (Junior): Thêm padding phải khi có icon để text không bị đè lên icon
          style={
            isPassword || error || success
              ? { paddingRight: "2.75rem" }
              : undefined
          }
          className={`${INPUT_BASE} ${stateClass} ${className}`}
          {...rest}
        />

        {/* === Trailing Icons (hiển thị theo trạng thái) === */}

        {/* Password toggle */}
        {isPassword && (
          <button
            type="button"
            tabIndex={-1} // Không dừng lại ở đây khi Tab qua form
            className="absolute right-3.5 top-1/2 -translate-y-1/2
                        transition-colors duration-150"
            style={{ color: "var(--color-ink-3)" }}
            onClick={() => setShowPwd((v) => !v)}
            aria-label={showPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}

        {/* Error icon */}
        {error && !isPassword && (
          <span
            className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--color-expense)" }}
          >
            <AlertCircle size={16} />
          </span>
        )}

        {/* Success icon */}
        {success && !isPassword && !error && (
          <span
            className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--color-income)" }}
          >
            <CheckCircle2 size={16} />
          </span>
        )}
      </div>

      {/* Hint / Error message */}
      {(error || hint || success) && (
        <p
          className="mt-1.5"
          style={{
            fontSize: "0.8125rem",
            color: error
              ? "var(--color-expense)"
              : success
                ? "var(--color-income)"
                : "var(--color-ink-3)",
            lineHeight: 1.4,
          }}
        >
          {error || success || hint}
        </p>
      )}
    </div>
  );
});

export default Input;
