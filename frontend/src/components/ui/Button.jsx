/**
 * components/ui/Button.jsx
 * Design: Sắc sảo, tự tin - không bo tròn quá đà, không màu sặc sỡ.
 * Nút Primary: nền charcoal đen, chữ kem. Hover: ánh gold tinh tế.
 * Triết lý: Một nút bấm tốt không cần hét lên, chỉ cần hiện diện đúng lúc.
 */
import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

/**
 * =========== VARIANT & SIZE MAPS ===========
 * Tách styles ra object map thay vì viết if/else dài dòng.
 * Lợi ích: Thêm variant mới chỉ cần thêm 1 dòng vào object, không sửa logic.
 * Pattern này gọi là 'variant map' - cực phổ biến trong production code.
 */
const VARIANT_STYLES = {
  // Nền đen sâu, chữ kem - flagship button của design system này
  primary: [
    "bg-[var(--color-ink)] text-[var(--color-bg)]",
    "border berdor-[var(--color-ink)]",
    "hover:bg-[#2A2A2A] hover:border-[#2A2A2A]",
    // Ánh gold tinh tế ở bottom border khi hover - subtle luxury touch
    "hover:shadow-[0_4px_20px_rgba(26,26,26,0.18),inset_0_-1px_0_rgba(212,168,67,0.4)]",
    "active:translate-y-px active:shadow-none",
  ].join(" "),

  // Nền trong, viền mỏng - variant thứ cấp, không tranh chú ý
  secondary: [
    "bg-[var(--color-bg-card)] text-[var(--color-ink)]",
    "border border-[var(--color-border)]",
    "hover:bg-[var(--color-bg-subtle)] hover:border-[var(--color-ink-3)]",
    "active:translate-y-px",
  ].join(" "),

  // Viền gold mỏng - dùng cho action có trọng số ngang Primary nhưng ít hơn một bậc
  outline: [
    "bg-transparent text-[var(--color-gold)]",
    "border boder-[var(--color-gold)]",
    "hover:bg-[var(--color-gold-bg), #FDFBF3]",
    "active:translate-y-px",
  ].join(" "),

  // Không viền, không nền - link-style, dùng trong context đã có nền
  ghost: [
    "bg-transparent text-[var(--color-ink-2)]",
    "border border-transparent",
    "hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-ink)]",
    "active:translate-y",
  ].join(" "),

  // Đỏ terra-cotta muted - dùng cho delete/destructive action
  danger: [
    "bg-[var(--color-expense)] text-white",
    "border border-[var-(--color-expense)]",
    "hover:bg-[#7A3F2F] hover:border-[#7A3F2F]",
    "hover:shadow-[0_4px_16px_rgba(139,74,58,0.25)]",
    "active:translate-y-px",
  ].join(" "),
};

const SIZE_STYLES = {
  /**
   * Mỗi size nên tự nhất quán về padding, font-size, gap icon
   * Đừng mix size SM với padding của MD - sẽ trông bất cân đối
   */
  sm: "h-8 px-3.5 text-[0.8125rem] gap-1.5 rounded-[6px]",
  md: "h-10 px-5 text-[0.9375rem] gap-2 rounded-[8px]",
  lg: "h-12 px-7 text-[1rem] gap-2.5 rounded-[10px]",
};

const BASE_STYLES = [
  // Layout
  "inline-flex items-center justify-center",
  "font-sans font-medium",
  // Transition - duration 200ms sweet sport: không quá nhanh (cảm giác rẻ), không quá chậm
  "transition-all duration-200",
  // Disable state
  "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
  // Loại bỏ focus outline mặc định của trình duyệt (xanh dương xấu)
  // Thay bằng focus-visible ring theo màu gold
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-2",
  "focus-visible:ring-offset-[var(--color-bg)]",
  // Chặn user select text khi click nhanh
  "select-none",
  "cursor-pointer",
].join(" ");

/**
 * ================ COMPONENTS ==================
 * Dùng 'forwardRef' để component nhận được ref từ bên ngoài
 * VD thực tế: Form library (React Hook Form) cần gắn ref vào input/button
 * để focus programmatically. Nếu không có forwardRef, tính năng này sẽ bị gãy.
 * Rule of thumb: Bất kỳ UI primitive (Button, Input, Select) nào cũng nên có forwardRef.
 */
const Button = forwardRef(function Button(
  {
    children,
    variant = "primary",
    size = "md",
    isLoading = false,
    className = "",
    disabled,
    leftIcon,
    rightIcon,
    ...rest // Spread các props còn lại (onClick, type, form, ...) xuống thẻ <button>
  },
  ref,
) {
  const variantClass = VARIANT_STYLES[variant] ?? VARIANT_STYLES.primary;
  const sizeClass = SIZE_STYLES[size] ?? SIZE_STYLES.md;

  return (
    <button
      ref={ref}
      // disabled khi isLoading để tránh double-submit
      disabled={disabled || isLoading}
      className={`${BASE_STYLES} ${variantClass} ${sizeClass} ${className}`}
      {...rest}
    >
      {/* Icon bên trái (nếu có) */}
      {leftIcon && !isLoading && <span className="shrink-0">{leftIcon}</span>}

      {/* Loading spinner - thay thế icon trái khi loading */}
      {isLoading && (
        <Loader2
          // Thêm aria-label và role cho accessibility
          // Screen reader sẽ đọc 'Đang tải' thay vì bỏ qua spinner
          aria-label="Đang tải"
          className="shrink-0 animate-spin"
          size={size === "sm" ? 13 : size === "lg" ? 17 : 15}
        />
      )}

      {/* Label */}
      <span className={isLoading ? "opacity-70" : ""}>{children}</span>

      {/* Icon bên phải (nếu có, ẩn khi loading) */}
      {rightIcon && !isLoading && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
});

export default Button;
