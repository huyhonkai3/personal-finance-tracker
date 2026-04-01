// =============================================
// components/budgets/BudgetProgress.jsx — Fix Tremor ProgressBar colors
// =============================================
// VẤN ĐỀ: Tremor ProgressBar dùng prop `color` để sinh Tailwind class động.
// Tailwind chỉ include class nào nó "thấy" trong source code lúc build.
// Khi dùng color={getProgressColor(percent)} -> runtime value -> Tailwind không scan được
// -> CSS class bị purge -> thanh bar không có màu -> INVISIBLE.
//
// GIẢI PHÁP: Thay vì dùng `color` prop của Tremor, tự vẽ progress bar
// bằng div thuần + CSS variable của design system.
// Cách này độc lập hoàn toàn với Tailwind purge, luôn render đúng.

import { useState, useEffect, useCallback } from "react";
import { TrendingUp, RefreshCw, Inbox } from "lucide-react";

import Card from "@/components/ui/Card";
import { getBudgetProgress } from "@/api/budgetApi";

// =============================================
// HELPERS
// =============================================
const formatVND = (amount) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);

// TỐI ƯU (Junior): Xử lý percent vượt quá 100%
// -----------------------------------------------------------
// Khi spentAmount > budgetAmount thì percent > 100.
// Progress bar phải clamp ở 100 để không tràn ra ngoài container.
// Thông tin "đã vượt X₫" hiển thị riêng bằng text, không qua chiều rộng bar.
// Math.max(0, ...) để phòng số âm (trường hợp data bất thường từ backend).
const clampPercent = (p) => Math.min(100, Math.max(0, p));

// Màu bar + màu nền theo phần trăm — dùng giá trị hex cố định thay vì Tailwind class
// để tránh bị purge khi class được tạo động lúc runtime.
const getProgressColors = (percent) => {
  if (percent > 100)
    return {
      bar: "var(--color-expense)", // terra cotta — vượt ngân sách
      bg: "var(--color-expense-bg)",
      text: "var(--color-expense)",
    };
  if (percent >= 80)
    return {
      bar: "#D97706", // amber-600 — cảnh báo
      bg: "#FEF3C7", // amber-100
      text: "#B45309", // amber-700
    };
  return {
    bar: "var(--color-income)", // emerald muted — bình thường
    bg: "var(--color-income-bg)",
    text: "var(--color-income)",
  };
};

const getStatusLabel = (percent, isOverBudget) => {
  if (isOverBudget || percent > 100) return "Vượt hạn mức";
  if (percent >= 80) return "Gần đến hạn mức";
  return "Đang kiểm soát tốt";
};

// =============================================
// SUB: CustomProgressBar — div thuần thay cho Tremor ProgressBar
// =============================================
function CustomProgressBar({ percent }) {
  const displayPct = clampPercent(percent);
  const colors = getProgressColors(percent);

  return (
    <div
      style={{
        width: "100%",
        height: "6px",
        borderRadius: "9999px",
        backgroundColor: colors.bg,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: displayPct + "%",
          borderRadius: "9999px",
          backgroundColor: colors.bar,
          transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />
    </div>
  );
}

// =============================================
// SUB: BudgetProgressItem
// =============================================
function BudgetProgressItem({ item, isLast }) {
  const {
    category,
    budgetAmount,
    spentAmount,
    remainingAmount,
    percentUsed,
    isOverBudget,
  } = item;

  const percent = percentUsed ?? Math.round((spentAmount / budgetAmount) * 100);
  const colors = getProgressColors(percent);
  const statusText = getStatusLabel(percent, isOverBudget);

  return (
    <div
      style={{
        padding: "1.375rem 1.5rem",
        borderBottom: isLast ? "none" : "1px solid rgba(26,26,26,0.06)",
      }}
    >
      {/* Row 1: Tên + % */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.5rem",
          gap: "0.75rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              flexShrink: 0,
              backgroundColor: category?.color || "var(--color-ink-3)",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.9375rem",
              fontWeight: 500,
              color: "var(--color-ink)",
              letterSpacing: "-0.005em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {category?.name || "—"}
          </span>
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: colors.text,
            letterSpacing: "0.01em",
            flexShrink: 0,
          }}
        >
          {percent}%
        </span>
      </div>

      {/* Row 2: Progress bar — DIV THUẦN, không dùng Tremor */}
      <div style={{ marginBottom: "0.5rem" }}>
        <CustomProgressBar percent={percent} />
      </div>

      {/* Row 3: Số tiền + trạng thái */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "0.875rem",
            color: "var(--color-ink-2)",
            letterSpacing: "-0.01em",
          }}
        >
          <span style={{ color: colors.text, fontWeight: 500 }}>
            {formatVND(spentAmount)}
          </span>
          <span style={{ color: "var(--color-ink-3)", margin: "0 0.25rem" }}>
            /
          </span>
          {formatVND(budgetAmount)}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              fontSize: "0.6875rem",
              fontWeight: 500,
              letterSpacing: "0.04em",
              color: colors.text,
            }}
          >
            {statusText}
          </span>
          {!isOverBudget && remainingAmount > 0 && (
            <>
              <span
                style={{ color: "var(--color-border)", fontSize: "0.75rem" }}
              >
                ·
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-ink-3)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                còn {formatVND(remainingAmount)}
              </span>
            </>
          )}
          {isOverBudget && (
            <>
              <span
                style={{ color: "var(--color-border)", fontSize: "0.75rem" }}
              >
                ·
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-expense)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                vượt {formatVND(Math.abs(remainingAmount))}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================
// SUB: EmptyState
// =============================================
function EmptyState() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "4rem 2rem",
        gap: "0.875rem",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          backgroundColor: "var(--color-bg-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Inbox size={22} style={{ color: "var(--color-ink-3)" }} />
      </div>
      <div>
        <p
          style={{
            fontSize: "0.9375rem",
            fontWeight: 500,
            color: "var(--color-ink-2)",
            marginBottom: "0.375rem",
          }}
        >
          Chưa có ngân sách nào
        </p>
        <p
          style={{
            fontSize: "0.8125rem",
            color: "var(--color-ink-3)",
            maxWidth: "260px",
            lineHeight: 1.5,
          }}
        >
          Thiết lập hạn mức chi tiêu cho từng danh mục để theo dõi dòng tiền
          hiệu quả hơn.
        </p>
      </div>
    </div>
  );
}

// =============================================
// MAIN COMPONENT
// =============================================
function BudgetProgress({ month, year, refreshKey }) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getBudgetProgress({ month, year });
      setData(res.data || []);
    } catch {
      setError("Không thể tải dữ liệu ngân sách. Vui lòng thử lại.");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [month, year, refreshKey]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const totalBudget = data.reduce((s, d) => s + d.budgetAmount, 0);
  const totalSpent = data.reduce((s, d) => s + d.spentAmount, 0);
  const overCount = data.filter((d) => d.isOverBudget).length;

  return (
    <Card variant="default" radius="lg" style={{ overflow: "hidden" }}>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.25rem 1.5rem",
          borderBottom: "1px solid var(--color-border)",
          gap: "1rem",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "2px",
            }}
          >
            <TrendingUp size={14} style={{ color: "var(--color-gold)" }} />
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
              Tiến độ chi tiêu
            </p>
          </div>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.125rem",
              fontWeight: 500,
              color: "var(--color-ink)",
              letterSpacing: "-0.015em",
            }}
          >
            Tháng {month}/{year}
          </h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
          {data.length > 0 && !isLoading && (
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  fontSize: "0.625rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-ink-3)",
                  marginBottom: "1px",
                }}
              >
                Tổng đã chi
              </p>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  color: "var(--color-ink)",
                  letterSpacing: "-0.01em",
                }}
              >
                {formatVND(totalSpent)}
              </p>
            </div>
          )}
          <button
            onClick={fetch}
            disabled={isLoading}
            style={{
              background: "transparent",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: isLoading ? "not-allowed" : "pointer",
              color: "var(--color-ink-3)",
              transition: "all 0.15s ease",
              flexShrink: 0,
            }}
            aria-label="Làm mới dữ liệu"
          >
            <RefreshCw
              size={13}
              style={{
                animation: isLoading ? "spin 0.8s linear infinite" : "none",
              }}
            />
          </button>
        </div>
      </div>

      {/* CẢNH BÁO */}
      {overCount > 0 && !isLoading && (
        <div
          style={{
            padding: "0.625rem 1.5rem",
            backgroundColor: "var(--color-expense-bg)",
            borderBottom: "1px solid rgba(139,74,58,0.15)",
          }}
        >
          <p style={{ fontSize: "0.8125rem", color: "var(--color-expense)" }}>
            ⚠ <strong>{overCount}</strong> danh mục đã vượt hạn mức tháng này.
          </p>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div
          style={{
            padding: "1rem 1.5rem",
            backgroundColor: "var(--color-expense-bg)",
          }}
        >
          <p style={{ fontSize: "0.875rem", color: "var(--color-expense)" }}>
            {error}
          </p>
        </div>
      )}

      {/* DANH SÁCH */}
      {isLoading ? (
        <div>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                padding: "1.375rem 1.5rem",
                borderBottom: "1px solid rgba(26,26,26,0.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.625rem",
                }}
              >
                <div
                  style={{
                    width: "40%",
                    height: "14px",
                    borderRadius: "4px",
                    backgroundColor: "var(--color-bg-subtle)",
                    animation: "shimmer 1.5s ease infinite",
                    opacity: 1 - i * 0.15,
                  }}
                />
                <div
                  style={{
                    width: "10%",
                    height: "14px",
                    borderRadius: "4px",
                    backgroundColor: "var(--color-bg-subtle)",
                    animation: "shimmer 1.5s ease infinite",
                  }}
                />
              </div>
              <div
                style={{
                  height: "6px",
                  borderRadius: "9999px",
                  backgroundColor: "var(--color-bg-subtle)",
                  marginBottom: "0.5rem",
                  animation: "shimmer 1.5s ease infinite",
                }}
              />
              <div
                style={{
                  width: "60%",
                  height: "12px",
                  borderRadius: "4px",
                  backgroundColor: "var(--color-bg-subtle)",
                  animation: "shimmer 1.5s ease infinite",
                }}
              />
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState />
      ) : (
        <div>
          {data.map((item, idx) => (
            <BudgetProgressItem
              key={item._id}
              item={item}
              isLast={idx === data.length - 1}
            />
          ))}
        </div>
      )}

      {/* FOOTER SUMMARY */}
      {data.length > 0 && !isLoading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "2rem",
            padding: "1rem 1.5rem",
            borderTop: "1px solid var(--color-border)",
            flexWrap: "wrap",
          }}
        >
          {[
            {
              label: "Tổng hạn mức",
              value: totalBudget,
              color: "var(--color-ink-2)",
            },
            {
              label: "Tổng đã chi",
              value: totalSpent,
              color:
                totalSpent > totalBudget
                  ? "var(--color-expense)"
                  : "var(--color-income)",
            },
            {
              label: "Còn lại",
              value: Math.max(0, totalBudget - totalSpent),
              color: "var(--color-ink-3)",
            },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ textAlign: "right" }}>
              <p
                style={{
                  fontSize: "0.625rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-ink-3)",
                  marginBottom: "2px",
                }}
              >
                {label}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color,
                  letterSpacing: "-0.01em",
                }}
              >
                {formatVND(value)}
              </p>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes shimmer { 0%,100%{opacity:.4} 50%{opacity:.8} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </Card>
  );
}

export default BudgetProgress;
