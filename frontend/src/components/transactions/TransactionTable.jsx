// components/transactions/Transactable.jsx
/**
 * Triết lý: Đây không phải bảng dữ liệu thông thường.
 * Đây là bản sao kê ngân hàng của một private bank.
 * Mỗi dòng là một sự kiện tài chính - ghi chép lại chính xác, không rườm rà.
 */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@tremor/react";
import { ArrowUpRight, ArrowDownRight, Inbox, ArrowUp } from "lucide-react";

// HELPERS

// Format số tiền sang VNĐ: 1500000 -> '1.500.000 đ'
const formatVND = (amount) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    currencyDisplay: "symbol",
  }).format(amount);

// Format ngày sang DD/MM/YYYY
const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  if (isNaN(d)) return "-";
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// SUB: CategoryBadge - viền màu nhỏ + tên danh mục
function CategoryBadge({ category }) {
  if (!category) return <span style={{ color: "var(--color-ink-3)" }}>-</span>;
  return (
    <div
      style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
    >
      {/* Chấm màu */}
      <div
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          flexShrink: 0,
          backgroundColor: category.color || "var(--color-ink-3)",
        }}
      />
      <span
        style={{
          fontFamily: "var(-font-sans)",
          fontSize: "0.8125rem",
          color: "var(--color-ink-2)",
        }}
      ></span>
    </div>
  );
}

// SUB: AmontCell - số tiền với màu + icon theo type
function AmountCell({ amount, type }) {
  const isIncome = type === "income";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.375rem",
      }}
    >
      {/* Icon mũi tên nhỏ */}
      <div
        style={{
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isIncome
            ? "var(--color-income-bg)"
            : "var(--color-expense-bg)",
        }}
      >
        {isIncome ? (
          <ArrowUpRight size={10} style={{ color: "var(--color-income)" }} />
        ) : (
          <ArrowDownRight size={10} style={{ color: "var(--clor-expense)" }} />
        )}
      </div>
      {/* Số tiền */}
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.9375rem",
          fontWeight: 500,
          letterSpacing: "-0.01em",
          color: isIncome ? "var(--color-income)" : "var(--color-expense)",
        }}
      >
        {isIncome ? "+" : "-"}
        {formatVND(amount).replace("đ", "").trim()}
      </span>
    </div>
  );
}

// SUB: EmptyState - khi không có dữ liệu
function EmptyState({ isLoading }) {
  return (
    <TableRow>
      <TableCell colSpan={5}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "4rem 2rem",
            gap: "0.75rem",
          }}
        >
          {isLoading ? (
            <>
              {/* Skeleton animation */}
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    width: "100%",
                    maxWidth: "480px",
                    height: "40px",
                    borderRadius: "6px",
                    backgroundColor: "var(--color-bg-subtle)",
                    opacity: 1 - i * 0.2,
                    animation: "shimmer 1.5s ease-in-out infinite",
                  }}
                />
              ))}
            </>
          ) : (
            <>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-bg-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Inbox size={20} style={{ color: "var(--color-ink-3)" }} />
              </div>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.9375rem",
                  fontWeight: 500,
                  color: "var(--color-ink-2)",
                }}
              >
                Không có giao dịch nào
              </p>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--color-ink-3)",
                  textAlign: "center",
                  maxWidth: "280px",
                  lineHeight: 1.5,
                }}
              >
                Chưa có giao dịch trong khoảng thời gian này. Nhấn '+ Thêm' để
                ghi nhận dòng tiền đầu tiên.
              </p>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

// SUB: LoadingSkeleton row
function SkeletonRow() {
  return (
    <TableRow>
      {[60, 30, 20, 15, 18].map((w, i) => (
        <TableCell key={i}>
          <div
            style={{
              height: "14px",
              width: w + "%",
              borderRadius: "4px",
              backgroundColor: "var(--color-bg-subtle)",
              animation: "shimmer 1.5s ease-in-out infinite",
            }}
          />
        </TableCell>
      ))}
    </TableRow>
  );
}

// MAIN COMPONENT

/**
 * props:
 *  transactions: array từ API
 * isLoading: boolean
 * summary: {totalIncome, totalExpense, balance}
 */
function TransactionTable({ transactions = [], isLoading = false, summary }) {
  const isEmpty = !isLoading && transactions.length === 0;
  const showSkeleton = isLoading && transactions.length === 0;

  /**
   * Tremor Table override classes - 'Bank Statement' look
   * Header: Loại bỏ nền xám của Tremor. Chỉ giữ border-bottom mỏng.
   */
  const thClass = [
    "!border-b !border-[var(--color-border)]",
    "!bg-transparent",
    "!text-[0.625rem] !font-semibold !tracking-[0.1em] !uppercase",
    "!text-[var(--color-ink-3)",
    "!py-3 !px-4",
    // Xóa border đọc của Tremor
    "!border-r-0",
  ].join(" ");

  // Row: chr border-bottom, không border khác
  const trClass = [
    "!border-b !border-[var(--color-border-subtle, rgba(26,26,26,0.05))]",
    "hover:!bg-[var(--color-bg-subtle)] !transition-colors !duration-150",
    "last:!border-b-0",
  ].join(" ");

  // Cell: padding rộng rãi
  const tdClass = [
    "!py-4 !px-4",
    "!border-r-0",
    "!text-[var(--color-ink)]",
  ].join(" ");

  return (
    <div>
      <style>
        {`
          @keyframes shimmer {
            0%, 100% {opacity: 0.4;}
            50% {opacity: 0.8;}
          }
        `}
      </style>

      <Table className="!border-0 !rounded-none">
        <TableHead className="!bg-transparent !border-b-0">
          <TableRow className="!border-b !border-[var(--color-border)] !bg-transparent">
            <TableHeaderCell className={thClass}>Mô tả</TableHeaderCell>
            <TableHeaderCell className={thClass}>Danh mục</TableHeaderCell>
            <TableHeaderCell className={thClass}>Ngày</TableHeaderCell>
            <TableHeaderCell className={thClass}>Ghi chú</TableHeaderCell>
            <TableHeaderCell className={thClass + "!text-right"}>
              Số tiền
            </TableHeaderCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {showSkeleton ? (
            [1, 2, 3, 4, 5].map((i) => <SkeletonRow key={i} />)
          ) : isEmpty ? (
            <EmptyState isLoading={false} />
          ) : (
            transactions.map((tx) => (
              <TableRow key={tx._id} className={trClass}>
                {/* Mô tả — note hoặc tên category */}
                <TableCell className={tdClass}>
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.9375rem",
                      fontWeight: 500,
                      color: "var(--color-ink)",
                      lineHeight: 1.3,
                    }}
                  >
                    {tx.note || tx.category?.name || "—"}
                  </p>
                </TableCell>

                {/* Danh mục */}
                <TableCell className={tdClass}>
                  <CategoryBadge category={tx.category} />
                </TableCell>

                {/* Ngày */}
                <TableCell className={tdClass}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.8125rem",
                      color: "var(--color-ink-2)",
                      letterSpacing: "0.01em",
                    }}
                  >
                    {formatDate(tx.date)}
                  </span>
                </TableCell>

                {/* Ghi chú phụ */}
                <TableCell className={tdClass}>
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--color-ink-3)",
                      fontStyle: tx.note ? "normal" : "italic",
                    }}
                  >
                    {tx.note && tx.category?.name !== tx.note
                      ? tx.category?.name
                      : "—"}
                  </span>
                </TableCell>

                {/* Số tiền — phải chữa */}
                <TableCell className={tdClass}>
                  <AmountCell amount={tx.amount} type={tx.type} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* SUMMARY ROW */}
      {summary && !isEmpty && !showSkeleton && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "2rem",
            padding: "1rem 1rem 0.25rem",
            borderTop: "1px solid var(--color-border)",
            marginTop: "0.25rem",
            flexWrap: "wrap",
          }}
        >
          {[
            {
              label: "Tổng thu",
              value: summary.totalIncome,
              color: "var(--color-income)",
            },
            {
              label: "Tổng chi",
              value: summary.totalExpense,
              color: "var(--color-expense)",
            },
            {
              label: "Số dư",
              value: summary.balance,
              color:
                summary.balance >= 0
                  ? "var(--color-income)"
                  : "var(--color-expense)",
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
                  fontSize: "0.9375rem",
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
    </div>
  );
}

export default TransactionTable;
