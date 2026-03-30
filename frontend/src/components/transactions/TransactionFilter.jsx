// components/transactions/TransactionFilter.jsx
/**
 * Thanh lọc nằm ngang phía trên bảng - không chiếm diện tích
 * Không ồn ào, chỉ 3 dropdown gọn gàng, nhất quán với Quiet Wealth.
 */
import { Select, SelectItem } from "@tremor/react";

// CONSTANT - tháng/năm/type
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

// Tạo list năm: 3 năm về trước đến năm hiện tại
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 4 }, (_, i) => {
  const y = currentYear - i;
  return { value: String(y), label: String(y) };
});

const TYPES = [
  { value: "all", label: "Tất cả" },
  { value: "income", label: "Thu nhập" },
  { value: "expense", label: "Chi tiêu" },
];

// Tremor Select override - khớp Quiet Wealth
const SELECT_CLASS = [
  "[&>button]:border-[var(--color-border)]",
  "[&>button]:rounded-[8px]",
  "[&>button]:bg-transparent",
  "[&>button]:text-[var(--color-ink)]",
  "[&>button]:text-[0.875rem]",
  "[&>button]:h-9",
  "[&>button]:px-3",
  "[&>button:focus]:border-[var(--color-gold)]",
  "[&>button:focus]:shadow-[0_0_0_3px_rgba(212,168,67,0.1)]",
  "[&>div]:border-[var(--color-border)]",
  "[&>div]:rounded-[10px]",
  "[&>div]:shadow-[0_8px_24px_rgba(26,26,26,0.08)]",
  "[&>div]:bg-[var(--color-bg-card)]",
].join(" ");

// MAIN COMPONENT
function TransactionFilter({ filters, onFilterChange }) {
  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        flexWrap: "wrap",
      }}
    >
      {/* Label nhỏ */}
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.6875rem",
          fontWeight: 500,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-ink-3)",
          whiteSpace: "nowrap",
        }}
      >
        Lọc theo
      </p>

      {/* Tháng */}
      <div style={{ minWidth: "120px" }}>
        <Select
          value={String(filters.month)}
          onValueChange={(v) => handleChange("month", Number(v))}
          className={SELECT_CLASS}
        >
          {MONTHS.map(({ value, label }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </Select>
      </div>

      {/* Phân cách */}
      <div
        style={{
          width: "1px",
          height: "20px",
          backgroundColor: "var(--color-border)",
          opacity: 0.8,
        }}
      />

      {/* Loại giao dịch */}
      <div style={{ minWidth: "120px" }}>
        <Select
          value={filters.type}
          onValueChange={(v) => handleChange("type", v)}
          className={SELECT_CLASS}
        >
          {TYPES.map(({ value, label }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </Select>
      </div>
    </div>
  );
}

export default TransactionFilter;
