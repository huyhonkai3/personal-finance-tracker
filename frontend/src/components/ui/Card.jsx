/**
 * ============ components/ui/Card.jsx
 * Design: Không gian âm (Negative Space) là ngôn ngữ chính.
 * Card không cần 'hét lên' - shadow mờ, border mảnh, padding rộng.
 * Nội dung bên trong được thở. Người dùng cảm thấy yên tâm, không bị áp lực.
 */

/**
 * Tách Card thành các sub-components nhỏ (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter) - pattern này gọi là Compound Component.
 * Lợi ích: Cực kỳ linh hoạt khi dùng
 * Giống hệt pattern của shadcn/ui, Radix UI và hầu hết design system chuyên nghiệp
 */

// ================ VARIANT DEFINITIONS ================
const CARD_VARIANTS = {
  // Default: nền trắng, border mỏng - floating nhẹ trên background
  default: {
    background: "var(--color-bg-card)",
    border: "1px solid var(--color-border)",
    boxShadow: "0 1px 4px rgba(26,26,26,0.04), 0 4px 16px rgbd(26,26,26,0.03)",
  },

  // Subtle: Nền cùng tone với bg, không bóng - section/grop container
  subtle: {
    background: "var(--color-bg-subtle)",
    border: "1px solid var(--color-border-subtle)",
    boxShadow: "none",
  },

  // Elevated: Shadow rộng hơn - modal-like, highlighted card
  elevated: {
    background: "var(--color-bg-card)",
    border: "1px solid var(--color-border)",
    boxShadow:
      "0 4px 12px rgba(26,26,26,0.06), 0 16px 48px rgba(26,26,26,0.06)",
  },

  // Gold-accent: Viền gold mỏng - highlight card đặc biệt (featured plan, cảnh báo quan trọng)
  accent: {
    background: "var(--color-gold-bg, #FDFBF3)",
    border: "1px solid rgba(212,168,67,0.35)",
    boxShadow: "0 0 0 1px rgba(212,168,67,0.1)",
  },

  // Transparent: Không nền, không bóng - dùng trong section đã có nền màu
  ghost: {
    background: "transparent",
    border: "none",
    boxShadow: "none",
  },
};

const RADIUS_MAP = {
  sm: "0.625rem",
  md: "1rem", // default
  lg: "1.25rem",
  xl: "1.5rem",
};

// =============== ROOT CARD ===============
function Card({
  children,
  variant = "default",
  radius = "md",
  className = "",
  style = {},
  onClick,
  ...rest
}) {
  const variantStyle = CARD_VARIANTS[variant] ?? CARD_VARIANTS.default;
  const borderRadius = RADIUS_MAP[radius] ?? RADIUS_MAP.md;

  // Khi card có onClick, thêm hover state để user biết nó clickable
  // Dùng cursor-pointer và hover scale nhẹ thay vì không có feedback gì
  const isInteractive = typeof onClick === "function";

  return (
    <div
      onClick={onClick}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      className={`
        overflow-hidden
        transition-all duration-200
        ${
          isInteractive
            ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(26,26,26,0.1)] active:translate-y-0"
            : ""
        }
        ${className}
      `}
      style={{
        ...variantStyle,
        borderRadius,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

// ============= SUB-COMPONENTS ===============

// Khu vực header - thường chứa title và description
function CardHeader({ children, className = "", style = {}, ...rest }) {
  return (
    <div className={`p-6 pb-0 ${className}`} style={style} {...rest}>
      {children}
    </div>
  );
}

// Tiêu đề card - dùng font Serif cho cảm giác sang trọng
function CardTitle({
  children,
  serif = false,
  className = "",
  style = {},
  ...rest
}) {
  return (
    <p
      className={className}
      style={{
        fontFamily: serif ? "var(--font-serif)" : "var(--font-sans)",
        fontSize: "1rem",
        fontWeight: 600,
        color: "var(--color-ink)",
        letterSpacing: serif ? "-0.01em" : "-0.005em",
        lineHeight: 1.3,
        ...style,
      }}
      {...rest}
    >
      {children}
    </p>
  );
}

// Mô tả nhỏ dưới tiêu đề
function CardDescription({ children, className = "", style = {}, ...rest }) {
  return (
    <p
      className={`mt-1 ${className}`}
      style={{
        fontSize: "0.875rem",
        color: "var(--color-ink-2)",
        lineHeight: 1.5,
        ...style,
      }}
      {...rest}
    >
      {children}
    </p>
  );
}

// Khu vực nội dung chính - padding đầy đủ
function CardContent({
  children,
  className = "",
  style = {},
  noPadding = false,
  ...rest
}) {
  return (
    <div
      className={`${noPadding ? "" : "p-6"} ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </div>
  );
}

// Khu vực footer - thường chứa action buttons
function CardFooter({ children, className = "", style = {}, ...rest }) {
  return (
    <div
      className={`px-6 py-4 ${className}`}
      style={{
        borderTop: "1px solid var(--color-border)",
        backgroundColor: "var(--color-bg-subtle)",
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

// ============== EXPORTS ================
/**
 * Gắn sub-components vào Card như static properties
 * Cho phép dùng: <Card.Header>, <Card.Title>, v.v
 * Giữ tất cả trong 1 namespace, không scattered import
 */
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export { CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
export default Card;
