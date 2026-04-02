// =============================================
// components/dashboard/MonthlyTrendChart.jsx
// =============================================
// Recharts thuần — không dùng Tremor chart để tránh CSS conflict.
// Triết lý: Bloomberg Terminal gặp private banking report.
// Grid tắt hết. Axis chữ xám nhạt. Bar bo tròn đầu.
// Mỗi tháng là 2 cột song song — Income (xanh ngọc) và Expense (terra cotta).

import { useState, useEffect, useCallback } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine,
} from "recharts";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import Card from "@/components/ui/Card";
import { getMonthlyTrend } from "@/api/transactionApi";

// =============================================
// DESIGN TOKENS — dùng hex cố định để Recharts
// set fill attribute trực tiếp, không cần Tailwind class
// =============================================
const COLOR_INCOME = "#3D6B5A"; // emerald muted — khớp với design system
const COLOR_EXPENSE = "#8B4A3A"; // terra cotta muted
const COLOR_INCOME_LIGHT = "rgba(61,107,90,0.12)";
const COLOR_EXPENSE_LIGHT = "rgba(139,74,58,0.12)";

// =============================================
// HELPERS
// =============================================
const formatVND = (amount) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);

// TỐI ƯU (Junior): formatYAxis — tại sao cần hàm này?
// -----------------------------------------------------------
// Recharts mặc định hiển thị số nguyên trên trục Y: "5000000", "10000000"...
// Với số tiền VNĐ hàng triệu, trục Y sẽ chiếm 80-100px chiều rộng,
// đẩy biểu đồ thu hẹp lại — layout vỡ, nhìn rất xấu.
//
// Recharts cung cấp prop `tickFormatter` trên YAxis:
//   <YAxis tickFormatter={formatYAxis} />
// Hàm này nhận giá trị số nguyên của mỗi tick và trả về string hiển thị.
//
// Tương tự, Tooltip dùng `content={<CustomTooltip />}` để hoàn toàn
// thay thế tooltip mặc định (vốn có style inline xấu từ thập niên 2010)
// bằng React component tự thiết kế với full CSS control.
//
// Pattern tổng quát: Recharts = "headless chart" — nó tính toán layout
// và data, còn việc render UI (tooltip, tick, label) hoàn toàn tuỳ biến
// qua các prop callback/component. Đây là điểm mạnh của Recharts so với
// các thư viện khác như Chart.js (canvas-based, khó custom).
const formatYAxis = (value) => {
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(0)}B`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}tr`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return String(value);
};

// Tên tháng ngắn tiếng Việt
const MONTH_NAMES = [
  "Th.1",
  "Th.2",
  "Th.3",
  "Th.4",
  "Th.5",
  "Th.6",
  "Th.7",
  "Th.8",
  "Th.9",
  "Th.10",
  "Th.11",
  "Th.12",
];

// =============================================
// Chuẩn bị data cho Recharts từ API response
// =============================================
const prepareChartData = (months = []) =>
  months.map((m) => ({
    name: MONTH_NAMES[(m.month ?? 1) - 1],
    month: m.month,
    income: m.income ?? 0,
    expense: m.expense ?? 0,
    balance: m.balance ?? 0,
  }));

// =============================================
// SUB: CustomTooltip — Recharts custom tooltip
// =============================================
// Recharts gọi component này với props: active, payload, label
// active: boolean — tooltip đang hiển thị không
// payload: array — data của bar đang hover [ { name, value, fill }, ... ]
// label: string — giá trị trục X của cột đang hover
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const income = payload.find((p) => p.dataKey === "income")?.value ?? 0;
  const expense = payload.find((p) => p.dataKey === "expense")?.value ?? 0;
  const balance = income - expense;

  return (
    <div
      style={{
        backgroundColor: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "10px",
        padding: "0.75rem 1rem",
        boxShadow:
          "0 4px 20px rgba(26,26,26,0.1), 0 1px 4px rgba(26,26,26,0.06)",
        minWidth: "160px",
      }}
    >
      {/* Label tháng */}
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.625rem",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-ink-3)",
          marginBottom: "0.625rem",
        }}
      >
        {label}
      </p>

      {/* Thu nhập */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          marginBottom: "0.375rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <div
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: COLOR_INCOME,
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.75rem",
              color: "var(--color-ink-2)",
            }}
          >
            Thu nhập
          </span>
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: COLOR_INCOME,
          }}
        >
          {formatVND(income)}
        </span>
      </div>

      {/* Chi tiêu */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          marginBottom: "0.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <div
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: COLOR_EXPENSE,
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.75rem",
              color: "var(--color-ink-2)",
            }}
          >
            Chi tiêu
          </span>
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: COLOR_EXPENSE,
          }}
        >
          {formatVND(expense)}
        </span>
      </div>

      {/* Divider */}
      <div
        style={{
          height: "1px",
          backgroundColor: "var(--color-border)",
          margin: "0.5rem 0",
        }}
      />

      {/* Số dư */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.75rem",
            color: "var(--color-ink-3)",
          }}
        >
          Số dư
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.875rem",
            fontWeight: 700,
            color: balance >= 0 ? COLOR_INCOME : COLOR_EXPENSE,
          }}
        >
          {balance >= 0 ? "+" : "−"}
          {formatVND(Math.abs(balance))}
        </span>
      </div>
    </div>
  );
}

// =============================================
// SUB: SkeletonChart
// =============================================
function SkeletonChart() {
  return (
    <div style={{ padding: "1rem 0" }}>
      {/* Bars skeleton — 12 cột giả */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "0.5rem",
          height: "140px",
          padding: "0 0.5rem",
        }}
      >
        {Array.from({ length: 12 }, (_, i) => {
          const h1 = 30 + Math.sin(i * 0.8) * 25 + 20;
          const h2 = 20 + Math.cos(i * 0.6) * 20 + 15;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                display: "flex",
                gap: "2px",
                alignItems: "flex-end",
              }}
            >
              <div
                className="animate-pulse"
                style={{
                  flex: 1,
                  height: h1 + "%",
                  borderRadius: "3px 3px 0 0",
                  backgroundColor: "var(--color-bg-subtle)",
                  animationDelay: i * 0.04 + "s",
                }}
              />
              <div
                className="animate-pulse"
                style={{
                  flex: 1,
                  height: h2 + "%",
                  borderRadius: "3px 3px 0 0",
                  backgroundColor: "var(--color-bg-subtle)",
                  animationDelay: i * 0.04 + 0.1 + "s",
                }}
              />
            </div>
          );
        })}
      </div>
      {/* X-axis skeleton */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginTop: "0.5rem",
          padding: "0 0.5rem",
        }}
      >
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className="animate-pulse"
            style={{
              flex: 1,
              height: "8px",
              borderRadius: "3px",
              backgroundColor: "var(--color-bg-subtle)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// =============================================
// SUB: EmptyChart
// =============================================
function EmptyChart() {
  return (
    <div
      style={{
        height: "180px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.9375rem",
          fontWeight: 500,
          color: "var(--color-ink-2)",
        }}
      >
        Chưa có dữ liệu
      </p>
      <p style={{ fontSize: "0.8125rem", color: "var(--color-ink-3)" }}>
        Năm này chưa có giao dịch nào được ghi nhận.
      </p>
    </div>
  );
}

// =============================================
// SUB: Legend — chú thích 2 màu + tổng năm
// =============================================
function ChartLegend({ yearTotals }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1.25rem",
        flexWrap: "wrap",
      }}
    >
      {[
        { color: COLOR_INCOME, label: "Thu nhập", value: yearTotals.income },
        { color: COLOR_EXPENSE, label: "Chi tiêu", value: yearTotals.expense },
      ].map(({ color, label, value }) => (
        <div
          key={label}
          style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "2px",
              backgroundColor: color,
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.75rem",
              color: "var(--color-ink-3)",
            }}
          >
            {label}
          </span>
          {value > 0 && (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                fontWeight: 500,
                color: "var(--color-ink-2)",
              }}
            >
              {formatYAxis(value)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// =============================================
// MAIN COMPONENT
// Props:
//   year:        năm muốn xem (số)
//   refreshKey:  tăng lên khi có giao dịch mới
// =============================================
function MonthlyTrendChart({ year, refreshKey = 0 }) {
  const [chartData, setChartData] = useState([]);
  const [yearTotals, setYearTotals] = useState({ income: 0, expense: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!year) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await getMonthlyTrend({ year });
      const months = res.data?.months ?? [];
      setChartData(prepareChartData(months));
      setYearTotals({
        income: months.reduce((s, m) => s + (m.income ?? 0), 0),
        expense: months.reduce((s, m) => s + (m.expense ?? 0), 0),
      });
    } catch {
      setError("Không thể tải dữ liệu xu hướng.");
    } finally {
      setIsLoading(false);
    }
  }, [year, refreshKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Kiểm tra có data thật không (loại bỏ tháng tất cả = 0)
  const hasData = chartData.some((m) => m.income > 0 || m.expense > 0);

  // Max value để YAxis không bị cắt
  const maxValue = Math.max(
    ...chartData.map((m) => Math.max(m.income, m.expense)),
    0,
  );

  return (
    <Card variant="default" radius="lg" style={{ overflow: "hidden" }}>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.25rem 1.5rem 0",
          flexWrap: "wrap",
          gap: "0.75rem",
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
            Xu hướng dòng tiền
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
            Cả năm {year}
          </h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
          {/* Balance cả năm */}
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
                Số dư năm
              </p>
              {(() => {
                const balance = yearTotals.income - yearTotals.expense;
                const isPos = balance >= 0;
                return (
                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: isPos ? COLOR_INCOME : COLOR_EXPENSE,
                    }}
                  >
                    {isPos ? "+" : "−"}
                    {formatYAxis(Math.abs(balance))}
                  </p>
                );
              })()}
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

      {/* LEGEND */}
      {hasData && !isLoading && (
        <div style={{ padding: "0.625rem 1.5rem 0" }}>
          <ChartLegend yearTotals={yearTotals} />
        </div>
      )}

      {/* CHART BODY */}
      <div style={{ padding: "0.5rem 0.5rem 1rem" }}>
        {isLoading ? (
          <SkeletonChart />
        ) : error ? (
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--color-expense)",
              padding: "1rem 1rem",
            }}
          >
            {error}
          </p>
        ) : !hasData ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={chartData}
              barCategoryGap="30%" // khoảng cách giữa các nhóm tháng
              barGap={3} // khoảng cách giữa 2 bar trong cùng nhóm
              margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
            >
              {/* Grid ngang cực nhẹ — không có dọc */}
              {/* Dùng CartesianGrid thay vì tắt hẳn để có đường guide mờ */}
              <XAxis
                dataKey="name"
                axisLine={false} // ẩn đường kẻ trục X
                tickLine={false} // ẩn vạch tick
                tick={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 10,
                  fill: "#A8A49E", // var(--color-ink-3) — hex để Recharts dùng được
                  fontWeight: 500,
                }}
                dy={6} // dịch xuống để cách bar một chút
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 10,
                  fill: "#A8A49E",
                }}
                tickFormatter={formatYAxis}
                width={36} // đủ cho "999tr", không ăn diện tích chart
                domain={[0, maxValue * 1.15]} // thêm 15% headroom để bar không sát viền trên
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(26,26,26,0.03)" }} // hover background cực nhẹ
              />

              {/* Bar Thu nhập — emerald muted */}
              <Bar
                dataKey="income"
                name="Thu nhập"
                fill={COLOR_INCOME}
                radius={[3, 3, 0, 0]} // bo góc trên
                maxBarSize={20}
              />

              {/* Bar Chi tiêu — terra cotta muted */}
              <Bar
                dataKey="expense"
                name="Chi tiêu"
                fill={COLOR_EXPENSE}
                radius={[3, 3, 0, 0]}
                maxBarSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Card>
  );
}

export default MonthlyTrendChart;
