// =============================================
// components/dashboard/DashboardMetrics.jsx
// =============================================
// Thiết kế: Không phải "3 ô màu mè" thông thường.
// Đây là bộ số liệu của một private wealth statement.
// Số dư chính — Playfair Display to, serif, tĩnh lặng như khắc trên đá.
// Thu/Chi phụ — nhỏ hơn, màu muted, không la hét.
// Cảm giác: Mở ra và biết ngay mình đang ở đâu về tài chính.

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import Card from "@/components/ui/Card";
import { getTransactionSummary } from "@/api/transactionApi";

// =============================================
// HELPER: Format VNĐ
// =============================================
const formatVND = (amount, compact = false) => {
  const abs = Math.abs(amount);
  if (compact) {
    if (abs >= 1_000_000_000) return `${(abs / 1_000_000_000).toFixed(1)} tỷ`;
    if (abs >= 1_000_000) return `${(abs / 1_000_000).toFixed(1)} tr`;
    if (abs >= 1_000) return `${(abs / 1_000).toFixed(0)}k`;
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
};

// =============================================
// TỐI ƯU (Junior): Tại sao dùng Skeleton Loading thay vì spinner?
// -----------------------------------------------------------
// Cách Fresher hay làm:
//   if (isLoading) return <div>Đang tải...</div>;
//
// Vấn đề:
//   1. Layout bị giật: Component biến mất hoàn toàn rồi đột ngột xuất hiện
//      -> Hiệu ứng CLS (Cumulative Layout Shift) làm các element khác nhảy lung tung.
//   2. Cảm giác chờ đợi: Spinner quay là tín hiệu "không biết bao giờ xong".
//      Skeleton giả lập hình dạng thật của data -> não người dùng "thấy" data sắp đến,
//      cảm giác chờ ngắn hơn dù thời gian thực là như nhau (nghiên cứu UX đã chứng minh).
//   3. Không gian trống: Spinner không giữ chỗ -> layout phía dưới bị dồn lên.
//
// Skeleton làm được:
//   - Giữ nguyên kích thước và vị trí của UI (không CLS)
//   - Truyền đạt cấu trúc data trước khi data đến
//   - `animate-pulse` của Tailwind: opacity fade in/out nhẹ nhàng -> mắt cảm nhận "đang xử lý"
//
// Áp dụng với tất cả component gọi API: Table, List, Card, Chart, v.v.
// =============================================

// =============================================
// SUB: SkeletonMetrics — Placeholder khi đang tải
// =============================================
function SkeletonMetrics() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "1rem",
      }}
      className="metrics-grid"
    >
      {/* Thẻ Balance — to hơn */}
      <Card
        variant="default"
        radius="lg"
        style={{ gridColumn: "span 3" }}
        className="metrics-balance-card"
      >
        <div style={{ padding: "1.75rem 2rem" }}>
          {/* Label skeleton */}
          <div
            className="animate-pulse"
            style={{
              height: "10px",
              width: "80px",
              borderRadius: "4px",
              backgroundColor: "var(--color-bg-subtle)",
              marginBottom: "1.25rem",
            }}
          />
          {/* Number skeleton — lớn */}
          <div
            className="animate-pulse"
            style={{
              height: "52px",
              width: "240px",
              borderRadius: "6px",
              backgroundColor: "var(--color-bg-subtle)",
              marginBottom: "0.875rem",
            }}
          />
          {/* Sub text skeleton */}
          <div
            className="animate-pulse"
            style={{
              height: "10px",
              width: "140px",
              borderRadius: "4px",
              backgroundColor: "var(--color-bg-subtle)",
            }}
          />
        </div>
      </Card>

      {/* Thẻ Income */}
      <Card variant="default" radius="lg">
        <div style={{ padding: "1.5rem 1.75rem" }}>
          <div
            className="animate-pulse"
            style={{
              height: "10px",
              width: "60px",
              borderRadius: "4px",
              backgroundColor: "var(--color-bg-subtle)",
              marginBottom: "1rem",
            }}
          />
          <div
            className="animate-pulse"
            style={{
              height: "32px",
              width: "130px",
              borderRadius: "5px",
              backgroundColor: "var(--color-bg-subtle)",
              marginBottom: "0.5rem",
            }}
          />
          <div
            className="animate-pulse"
            style={{
              height: "10px",
              width: "80px",
              borderRadius: "4px",
              backgroundColor: "var(--color-bg-subtle)",
            }}
          />
        </div>
      </Card>

      {/* Thẻ Expense */}
      <Card variant="default" radius="lg">
        <div style={{ padding: "1.5rem 1.75rem" }}>
          <div
            className="animate-pulse"
            style={{
              height: "10px",
              width: "60px",
              borderRadius: "4px",
              backgroundColor: "var(--color-bg-subtle)",
              marginBottom: "1rem",
            }}
          />
          <div
            className="animate-pulse"
            style={{
              height: "32px",
              width: "130px",
              borderRadius: "5px",
              backgroundColor: "var(--color-bg-subtle)",
              marginBottom: "0.5rem",
            }}
          />
          <div
            className="animate-pulse"
            style={{
              height: "10px",
              width: "80px",
              borderRadius: "4px",
              backgroundColor: "var(--color-bg-subtle)",
            }}
          />
        </div>
      </Card>

      {/* Thẻ Count */}
      <Card variant="default" radius="lg">
        <div style={{ padding: "1.5rem 1.75rem" }}>
          <div
            className="animate-pulse"
            style={{
              height: "10px",
              width: "70px",
              borderRadius: "4px",
              backgroundColor: "var(--color-bg-subtle)",
              marginBottom: "1rem",
            }}
          />
          <div
            className="animate-pulse"
            style={{
              height: "32px",
              width: "60px",
              borderRadius: "5px",
              backgroundColor: "var(--color-bg-subtle)",
              marginBottom: "0.5rem",
            }}
          />
          <div
            className="animate-pulse"
            style={{
              height: "10px",
              width: "90px",
              borderRadius: "4px",
              backgroundColor: "var(--color-bg-subtle)",
            }}
          />
        </div>
      </Card>
    </div>
  );
}

// =============================================
// SUB: BalanceCard — Thẻ số dư chủ đạo
// =============================================
function BalanceCard({ balance, month, year }) {
  const isPositive = balance >= 0;
  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });

  return (
    <Card
      variant="default"
      radius="lg"
      style={{ gridColumn: "span 3", position: "relative", overflow: "hidden" }}
      className="metrics-balance-card"
    >
      {/* Decorative gold circle — tinh tế ở góc */}
      <div
        style={{
          position: "absolute",
          top: "-40px",
          right: "-40px",
          width: "160px",
          height: "160px",
          borderRadius: "50%",
          backgroundColor: "var(--color-gold)",
          opacity: 0.04,
          pointerEvents: "none",
        }}
      />

      <div style={{ padding: "1.75rem 2rem", position: "relative", zIndex: 1 }}>
        {/* Label */}
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.625rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-ink-3)",
            marginBottom: "0.875rem",
          }}
        >
          Số dư · {monthLabel}
        </p>

        {/* Con số HERO — Playfair Display, cực lớn */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "0.5rem",
            marginBottom: "0.75rem",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
              fontWeight: 500,
              letterSpacing: "-0.03em",
              lineHeight: 1,
              color: "var(--color-ink)",
              fontFeatureSettings: '"tnum" on',
            }}
          >
            {formatVND(Math.abs(balance))}
          </p>
        </div>

        {/* Trend indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              padding: "2px 8px",
              borderRadius: "100px",
              backgroundColor: isPositive
                ? "var(--color-income-bg)"
                : "var(--color-expense-bg)",
            }}
          >
            {isPositive ? (
              <TrendingUp size={11} style={{ color: "var(--color-income)" }} />
            ) : (
              <TrendingDown
                size={11}
                style={{ color: "var(--color-expense)" }}
              />
            )}
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.6875rem",
                fontWeight: 600,
                color: isPositive
                  ? "var(--color-income)"
                  : "var(--color-expense)",
              }}
            >
              {isPositive ? "Dương" : "Âm"}
            </span>
          </div>
          <span style={{ fontSize: "0.8125rem", color: "var(--color-ink-3)" }}>
            Thu nhập {isPositive ? "vượt" : "không đủ bù"} chi tiêu tháng này
          </span>
        </div>
      </div>

      {/* Bottom accent line vàng */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "2rem",
          width: "3rem",
          height: "2px",
          borderRadius: "2px",
          backgroundColor: "var(--color-gold)",
          opacity: 0.5,
        }}
      />
    </Card>
  );
}

// =============================================
// SUB: MiniMetricCard — Thu nhập / Chi tiêu / Số giao dịch
// =============================================
function MiniMetricCard({ label, amount, isCount = false, type }) {
  // type: "income" | "expense" | "neutral"
  const colorMap = {
    income: {
      text: "var(--color-income)",
      bg: "var(--color-income-bg)",
      Icon: TrendingUp,
    },
    expense: {
      text: "var(--color-expense)",
      bg: "var(--color-expense-bg)",
      Icon: TrendingDown,
    },
    neutral: {
      text: "var(--color-ink-2)",
      bg: "var(--color-bg-subtle)",
      Icon: Minus,
    },
  };

  const { text, bg, Icon } = colorMap[type] || colorMap.neutral;

  return (
    <Card variant="default" radius="lg">
      <div style={{ padding: "1.5rem 1.75rem" }}>
        {/* Icon + Label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.625rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-ink-3)",
            }}
          >
            {label}
          </p>
          <div
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "8px",
              backgroundColor: bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon size={12} style={{ color: text }} strokeWidth={2.25} />
          </div>
        </div>

        {/* Số */}
        <p
          style={{
            // Count dùng font mono, tiền dùng font serif
            fontFamily: isCount ? "var(--font-mono)" : "var(--font-serif)",
            fontSize: isCount ? "1.75rem" : "1.5rem",
            fontWeight: 500,
            letterSpacing: isCount ? "0" : "-0.025em",
            lineHeight: 1.1,
            color: type === "neutral" ? "var(--color-ink)" : text,
            marginBottom: "0.375rem",
            fontFeatureSettings: '"tnum" on',
          }}
        >
          {isCount ? amount : formatVND(amount, false)}
        </p>

        {/* Sub label */}
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.75rem",
            color: "var(--color-ink-3)",
          }}
        >
          {isCount ? "giao dịch tháng này" : "tháng này"}
        </p>
      </div>
    </Card>
  );
}

// =============================================
// MAIN COMPONENT
// =============================================
// Props:
//   month (number): tháng hiện tại
//   year  (number): năm hiện tại
function DashboardMetrics({ month, year, refreshKey = 0 }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!month || !year) return;

    const fetch = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getTransactionSummary({ month, year });
        setData(res.data);
      } catch {
        setError("Không thể tải dữ liệu tổng quan.");
      } finally {
        setIsLoading(false);
      }
    };

    fetch();
  }, [month, year, refreshKey]);

  // ---- SKELETON ----
  if (isLoading) return <SkeletonMetrics />;

  // ---- ERROR ----
  if (error)
    return (
      <div
        style={{
          padding: "1.25rem 1.5rem",
          borderRadius: "12px",
          backgroundColor: "var(--color-expense-bg)",
          border: "1px solid rgba(139,74,58,0.2)",
        }}
      >
        <p style={{ fontSize: "0.875rem", color: "var(--color-expense)" }}>
          {error}
        </p>
      </div>
    );

  // ---- DATA ----
  const {
    totalIncome = 0,
    totalExpense = 0,
    balance = 0,
    count = 0,
  } = data || {};

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem",
        }}
        className="metrics-grid"
      >
        {/* Hero balance — full width */}
        <BalanceCard balance={balance} month={month} year={year} />

        {/* Thu nhập */}
        <MiniMetricCard label="Thu nhập" amount={totalIncome} type="income" />

        {/* Chi tiêu */}
        <MiniMetricCard label="Chi tiêu" amount={totalExpense} type="expense" />

        {/* Số giao dịch */}
        <MiniMetricCard
          label="Giao dịch"
          amount={count}
          isCount={true}
          type="neutral"
        />
      </div>

      {/* Responsive grid */}
      <style>{`
        @media (max-width: 767px) {
          .metrics-grid {
            grid-template-columns: 1fr !important;
          }
          .metrics-balance-card {
            grid-column: span 1 !important;
          }
        }
      `}</style>
    </>
  );
}

export default DashboardMetrics;
