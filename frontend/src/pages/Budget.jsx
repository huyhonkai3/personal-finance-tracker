// =============================================
// pages/Budgets.jsx — Trang quản lý ngân sách
// =============================================
// Layout: Form bên trái (sticky) + Danh sách progress bên phải
// Trên mobile: Stack dọc, form xuống dưới để progress được xem trước

import { useState } from "react";
import { Select, SelectItem } from "@tremor/react";
import BudgetForm from "@/components/budgets/BudgetForm";
import BudgetProgress from "@/components/budgets/BudgetProgress";

// Tremor Select override nhỏ gọn cho filter tháng/năm
const SELECT_FILTER_CLASS = [
  "[&>button]:border-[var(--color-border)]",
  "[&>button]:rounded-[8px]",
  "[&>button]:bg-transparent",
  "[&>button]:text-[var(--color-ink)]",
  "[&>button]:text-[0.875rem]",
  "[&>button]:h-9",
  "[&>button]:px-3",
  "[&>button:focus]:border-[var(--color-gold)]",
  "[&>div]:border-[var(--color-border)]",
  "[&>div]:rounded-[10px]",
  "[&>div]:shadow-[0_8px_24px_rgba(26,26,26,0.08)]",
  "[&>div]:bg-[var(--color-bg-card)]",
].join(" ");

const MONTHS = [
  { value: "1", label: "Tháng 1" },
  { value: "2", label: "Tháng 2" },
  { value: "3", label: "Tháng 3" },
  { value: "4", label: "Tháng 4" },
  { value: "5", label: "Tháng 5" },
  { value: "6", label: "Tháng 6" },
  { value: "7", label: "Tháng 7" },
  { value: "8", label: "Tháng 8" },
  { value: "9", label: "Tháng 9" },
  { value: "10", label: "Tháng 10" },
  { value: "11", label: "Tháng 11" },
  { value: "12", label: "Tháng 12" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 3 }, (_, i) => {
  const y = currentYear + i;
  return { value: String(y), label: String(y) };
});

// =============================================
// MAIN PAGE
// =============================================
function Budgets() {
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(String(now.getMonth() + 1));
  const [viewYear, setViewYear] = useState(String(now.getFullYear()));
  // refreshKey: tăng lên mỗi khi tạo budget thành công -> BudgetProgress tự refetch
  const [refreshKey, setRefreshKey] = useState(0);

  const handleBudgetCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div
      style={{ backgroundColor: "var(--color-bg)", minHeight: "100vh" }}
      className="animate-fade-in"
    >
      <div className="max-w-5xl mx-auto px-5 md:px-8 py-10 md:py-14">
        {/* ===== PAGE HEADER ===== */}
        <div style={{ marginBottom: "2.5rem" }}>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.625rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-ink-3)",
              marginBottom: "0.375rem",
            }}
          >
            Tài chính cá nhân
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
                fontWeight: 500,
                letterSpacing: "-0.025em",
                color: "var(--color-ink)",
                lineHeight: 1.15,
              }}
            >
              Ngân sách tháng này
            </h1>

            {/* Bộ lọc tháng/năm cho BudgetProgress */}
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}
            >
              <p
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--color-ink-3)",
                  whiteSpace: "nowrap",
                }}
              >
                Xem tháng
              </p>
              <div style={{ minWidth: "108px" }}>
                <Select
                  value={viewMonth}
                  onValueChange={setViewMonth}
                  className={SELECT_FILTER_CLASS}
                >
                  {MONTHS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div style={{ minWidth: "88px" }}>
                <Select
                  value={viewYear}
                  onValueChange={setViewYear}
                  className={SELECT_FILTER_CLASS}
                >
                  {YEARS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {/* Đường kẻ vàng trang trí */}
          <div
            style={{
              width: "3rem",
              height: "2px",
              borderRadius: "2px",
              backgroundColor: "var(--color-gold)",
              opacity: 0.6,
              marginTop: "1.25rem",
            }}
          />
        </div>

        {/* ===== MAIN LAYOUT: 2 cột ===== */}
        {/*
          Desktop: Form (cột nhỏ 320px sticky) + Progress (cột lớn, còn lại)
          Mobile:  Stack dọc — Progress lên đầu để user thấy data ngay,
                   Form xuống dưới (họ cần xem trước khi thêm)
        */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "1.5rem",
          }}
          className="budget-layout"
        >
          {/* Progress — trên mobile hiển thị trước */}
          <div className="budget-progress-col">
            <BudgetProgress
              month={Number(viewMonth)}
              year={Number(viewYear)}
              refreshKey={refreshKey}
            />
          </div>

          {/* Form — sticky khi scroll trên desktop */}
          <div className="budget-form-col">
            <div style={{ position: "sticky", top: "80px" }}>
              <BudgetForm onSuccess={handleBudgetCreated} />

              {/* Tip nhỏ bên dưới form */}
              <div
                style={{
                  marginTop: "1rem",
                  padding: "0.875rem 1rem",
                  backgroundColor: "var(--color-bg-subtle)",
                  borderRadius: "10px",
                  border: "1px solid var(--color-border)",
                }}
              >
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-ink-3)",
                    lineHeight: 1.5,
                  }}
                >
                  💡{" "}
                  <strong style={{ color: "var(--color-ink-2)" }}>
                    Gợi ý:
                  </strong>{" "}
                  Đặt ngân sách chi tiêu cho ít nhất 3–5 danh mục quan trọng
                  nhất để theo dõi hiệu quả. Ngân sách có thể cập nhật bất cứ
                  lúc nào.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive CSS */}
      <style>{`
        @media (min-width: 768px) {
          .budget-layout {
            grid-template-columns: 1fr 320px !important;
          }
          /* Desktop: Progress trái, Form phải */
          .budget-progress-col { order: 1; }
          .budget-form-col     { order: 2; }
        }
        /* Mobile: Progress trước, Form sau */
        .budget-progress-col { order: 1; }
        .budget-form-col     { order: 2; }
      `}</style>
    </div>
  );
}

export default Budgets;
