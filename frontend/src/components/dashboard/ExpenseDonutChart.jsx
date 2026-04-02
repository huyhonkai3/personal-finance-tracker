// =============================================
// components/dashboard/ExpenseDonutChart.jsx
// =============================================
// Bỏ Tremor DonutChart vì nó dùng Tailwind class để set màu (fill-emerald-500),
// và class đó bị purge trong production build.
// Thay bằng Recharts PieChart trực tiếp — Recharts nhận hex và set
// fill attribute trên SVG path, không cần Tailwind class nào.
// Recharts đã có sẵn vì là peer dependency của @tremor/react.

import { useState, useEffect, useCallback } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { PieChart as PieIcon, RefreshCw } from "lucide-react";
import Card from "@/components/ui/Card";
import { getExpenseByCategory } from "@/api/transactionApi";

// =============================================
// HELPERS
// =============================================
const formatVND = (amount) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);

const formatVNDCompact = (amount) => {
  if (amount >= 1_000_000_000)
    return `${(amount / 1_000_000_000).toFixed(1)} tỷ`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} tr`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}k`;
  return formatVND(amount);
};

// =============================================
// PALETTE fallback khi category không có màu hợp lệ
// Màu phù hợp với "Quiet Wealth" tone — không quá sặc sỡ
// =============================================
const FALLBACK_PALETTE = [
  "#3D6B5A", // emerald muted — income green
  "#D4A843", // gold accent
  "#8B4A3A", // terra cotta — expense
  "#5B7FA6", // muted blue
  "#8B7355", // warm brown
  "#6B7B8D", // slate blue
  "#7C5E8A", // muted purple
  "#5A8A6A", // sage green
  "#A67C52", // tan
  "#4A7A8A", // teal muted
];

const resolveColor = (hex, index) => {
  if (
    hex &&
    typeof hex === "string" &&
    hex.startsWith("#") &&
    hex.length >= 4
  ) {
    return hex;
  }
  return FALLBACK_PALETTE[index % FALLBACK_PALETTE.length];
};

// TỐI ƯU (Junior): Xử lý an toàn mảng dữ liệu rỗng
// -----------------------------------------------------------
// Luôn filter trước khi truyền vào chart library:
// - slice value = 0 → PieChart render lỗi hoặc tạo slice vô hình
// - mảng rỗng [] → crash khi library tính tổng chia 0
// Sau khi filter, nếu vẫn rỗng → render EmptyState thay vì chart
const safePrepareData = (categories = []) =>
  categories
    .filter((c) => c && c.totalAmount > 0)
    .map((c, i) => ({
      name: c.name || "Không rõ",
      value: c.totalAmount,
      color: resolveColor(c.color, i),
      pct: c.percentage,
    }));

// =============================================
// SUB: CustomTooltip — Tooltip Recharts custom style
// =============================================
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value, color } = payload[0].payload;
  return (
    <div
      style={{
        backgroundColor: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "8px",
        padding: "0.625rem 0.875rem",
        boxShadow: "0 4px 16px rgba(26,26,26,0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "0.25rem",
        }}
      >
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: color,
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.8125rem",
            color: "var(--color-ink-2)",
          }}
        >
          {name}
        </span>
      </div>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.9375rem",
          fontWeight: 600,
          color: "var(--color-ink)",
          letterSpacing: "-0.01em",
        }}
      >
        {formatVND(value)}
      </p>
    </div>
  );
}

// =============================================
// SUB: CenterLabel — SVG text ở tâm donut
// =============================================
function CenterLabel({ cx, cy, total }) {
  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="middle">
        <tspan
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.875rem",
            fontWeight: 600,
            fill: "var(--color-ink)",
          }}
        >
          {formatVNDCompact(total)}
        </tspan>
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" dominantBaseline="middle">
        <tspan
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.625rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            fill: "var(--color-ink-3)",
          }}
        >
          tổng chi
        </tspan>
      </text>
    </g>
  );
}

// =============================================
// SUB: SkeletonDonut
// =============================================
function SkeletonDonut() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "2rem",
        padding: "1rem 0",
      }}
    >
      <div
        className="animate-pulse"
        style={{
          width: "152px",
          height: "152px",
          borderRadius: "50%",
          background: "conic-gradient(var(--color-bg-subtle) 0deg 360deg)",
          mask: "radial-gradient(farthest-side, transparent 56%, #000 57%)",
          WebkitMask:
            "radial-gradient(farthest-side, transparent 56%, #000 57%)",
          flexShrink: 0,
        }}
      />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        {[65, 50, 80, 40].map((w, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}
          >
            <div
              className="animate-pulse"
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                backgroundColor: "var(--color-bg-subtle)",
                flexShrink: 0,
              }}
            />
            <div
              className="animate-pulse"
              style={{
                height: "11px",
                width: w + "%",
                borderRadius: "3px",
                backgroundColor: "var(--color-bg-subtle)",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================
// SUB: EmptyDonut
// =============================================
function EmptyDonut() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "2rem",
        padding: "1rem 0",
      }}
    >
      {/* Vòng tròn xám mờ giống hình dạng chart thật */}
      <svg
        width="152"
        height="152"
        viewBox="0 0 152 152"
        style={{ flexShrink: 0 }}
      >
        <circle
          cx="76"
          cy="76"
          r="56"
          fill="none"
          stroke="var(--color-bg-subtle)"
          strokeWidth="24"
        />
        <foreignObject x="48" y="60" width="56" height="32">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PieIcon size={16} style={{ color: "var(--color-ink-3)" }} />
          </div>
        </foreignObject>
      </svg>
      <div>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.9375rem",
            fontWeight: 500,
            color: "var(--color-ink-2)",
            marginBottom: "0.375rem",
          }}
        >
          Chưa có chi tiêu
        </p>
        <p
          style={{
            fontSize: "0.8125rem",
            color: "var(--color-ink-3)",
            lineHeight: 1.5,
            maxWidth: "180px",
          }}
        >
          Tháng này chưa ghi nhận giao dịch chi tiêu nào.
        </p>
      </div>
    </div>
  );
}

// =============================================
// SUB: Legend
// =============================================
function Legend({ items, totalExpense }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        flex: 1,
        minWidth: 0,
      }}
    >
      {items.map((item) => (
        <div
          key={item.name}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.5rem",
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
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                flexShrink: 0,
                backgroundColor: item.color,
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.8125rem",
                color: "var(--color-ink-2)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.name}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "0.375rem",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6875rem",
                color: "var(--color-ink-3)",
              }}
            >
              {item.pct != null
                ? item.pct.toFixed(1)
                : Math.round((item.value / totalExpense) * 100)}
              %
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "var(--color-ink)",
              }}
            >
              {formatVNDCompact(item.value)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================
// MAIN COMPONENT
// Props:
//   month, year: để fetch đúng tháng
//   refreshKey:  tăng lên khi có giao dịch mới -> tự refetch
// =============================================
function ExpenseDonutChart({ month, year, refreshKey = 0 }) {
  const [rawData, setRawData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // useCallback để fetch có thể gọi thủ công (nút refresh)
  const fetchData = useCallback(async () => {
    if (!month || !year) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await getExpenseByCategory({ month, year });
      setRawData(res.data);
    } catch {
      setError("Không thể tải dữ liệu chi tiêu.");
    } finally {
      setIsLoading(false);
    }
  }, [month, year, refreshKey]); // refreshKey thay đổi → re-fetch tự động

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const chartData = rawData ? safePrepareData(rawData.categories) : [];
  const totalExpense = rawData?.totalExpense ?? 0;
  const hasData = chartData.length > 0;

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });

  return (
    <Card variant="default" radius="lg" style={{ overflow: "visible" }}>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.25rem 1.5rem 0",
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.625rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-ink-3)",
              marginBottom: "2px",
            }}
          >
            Phân bổ chi tiêu
          </p>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1rem",
              fontWeight: 500,
              color: "var(--color-ink)",
              letterSpacing: "-0.015em",
            }}
          >
            {monthLabel}
          </h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {hasData && !isLoading && (
            <div style={{ textAlign: "right" }}>
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
                Tổng chi
              </p>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--color-expense)",
                }}
              >
                {formatVND(totalExpense)}
              </p>
            </div>
          )}
          <button
            onClick={fetchData}
            disabled={isLoading}
            aria-label="Làm mới"
            style={{
              background: "transparent",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              width: "30px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: isLoading ? "not-allowed" : "pointer",
              color: "var(--color-ink-3)",
              flexShrink: 0,
            }}
          >
            <RefreshCw
              size={12}
              style={{
                animation: isLoading ? "spin 0.8s linear infinite" : "none",
              }}
            />
          </button>
        </div>
      </div>

      {/* BODY */}
      <div style={{ padding: "0.75rem 1.5rem 1.25rem" }}>
        {isLoading ? (
          <SkeletonDonut />
        ) : error ? (
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--color-expense)",
              padding: "1rem 0",
            }}
          >
            {error}
          </p>
        ) : !hasData ? (
          <EmptyDonut />
        ) : (
          <div
            style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}
            className="donut-layout"
          >
            {/* Recharts PieChart — fill dùng hex trực tiếp qua Cell, không cần Tailwind */}
            <div style={{ width: "152px", height: "152px", flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={chartData.length > 1 ? 2 : 0}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    strokeWidth={0}
                  >
                    {chartData.map((entry, index) => (
                      // Cell: set fill hex trực tiếp trên SVG path element
                      // Không cần class, không bị Tailwind purge
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  {/* Label tâm — dùng customized label component */}
                  <Pie
                    data={[{ value: 1 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={0}
                    dataKey="value"
                    label={({ cx, cy }) => (
                      <CenterLabel cx={cx} cy={cy} total={totalExpense} />
                    )}
                    labelLine={false}
                    fill="transparent"
                    stroke="none"
                  />
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <Legend items={chartData} totalExpense={totalExpense} />
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 480px) {
          .donut-layout {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
        }
      `}</style>
    </Card>
  );
}

export default ExpenseDonutChart;
