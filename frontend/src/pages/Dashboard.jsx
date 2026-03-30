// pages/Dashboard.jsx
// Thêm TransactionForm dưới dạng Modal/Slide-in panel
// khi user nhấn nút "+ Thêm" ở header.

import { useState } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ChevronRight,
  X,
} from "lucide-react";
import TransactionForm from "@/components/transactions/TransactionForm";

// ============ MOCK DATA ============
const MOCK_BALANCE = 124_350_000;
const MOCK_INCOME = 18_500_000;
const MOCK_EXPENSE = 6_230_000;

const MOCK_TRANSACTIONS = [
  {
    id: 1,
    name: "Lương tháng 6",
    category: "Income",
    amount: +18500000,
    date: "June 28",
  },
  {
    id: 2,
    name: "Grab Food",
    category: "Food & Dining",
    amount: -185000,
    date: "June 27",
  },
  {
    id: 3,
    name: "Shopee",
    category: "Shopping",
    amount: -840000,
    date: "June 26",
  },
  {
    id: 4,
    name: "Tiền nhà",
    category: "Housing",
    amount: -4500000,
    date: "June 25",
  },
  {
    id: 5,
    name: "Đầu tư VNINDEX",
    category: "Investment",
    amount: +2000000,
    date: "June 24",
  },
];

const formatVND = (amount, compact = false) => {
  const abs = Math.abs(amount);
  if (compact) {
    if (abs >= 1_000_000_000) return `${(abs / 1_000_000_000).toFixed(1)} tỷ`;
    if (abs >= 1_000_000) return `${(abs / 1_000_000).toFixed(0)} tr`;
    if (abs >= 1_000) return `${(abs / 1_000).toFixed(0)}k`;
    return abs.toLocaleString("vi-VN");
  }
  return abs.toLocaleString("vi-VN") + " ₫";
};

function StatCard({ label, amount, isIncome }) {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="label-caps">{label}</p>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: isIncome
              ? "var(--color-income-bg)"
              : "var(--color-expense-bg)",
          }}
        >
          {isIncome ? (
            <ArrowUpRight size={14} style={{ color: "var(--color-income)" }} />
          ) : (
            <ArrowDownRight
              size={14}
              style={{ color: "var(--color-expense)" }}
            />
          )}
        </div>
      </div>
      <p
        className="amount-display text-2xl"
        style={{ color: "var(--color-ink)" }}
      >
        {formatVND(amount, true)}
      </p>
      <p style={{ fontSize: "0.8125rem", color: "var(--color-ink-3)" }}>
        Tháng này
      </p>
    </div>
  );
}

function TransactionRow({ tx }) {
  const isIncome = tx.amount > 0;
  return (
    <div
      className="flex items-center gap-4 py-4 group cursor-pointer"
      style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
    >
      <div
        className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
        style={{ backgroundColor: "var(--color-bg-subtle)" }}
      >
        <span style={{ fontSize: "1rem" }}>
          {isIncome
            ? "💰"
            : tx.category === "Food & Dining"
              ? "🍜"
              : tx.category === "Shopping"
                ? "🛍️"
                : tx.category === "Housing"
                  ? "🏠"
                  : tx.category === "Investment"
                    ? "📈"
                    : "💳"}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p
          style={{
            fontSize: "0.9375rem",
            fontWeight: 500,
            color: "var(--color-ink)",
          }}
          className="truncate"
        >
          {tx.name}
        </p>
        <p className="label-caps mt-0.5">{tx.category}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p
          className="amount-display text-base"
          style={{
            color: isIncome ? "var(--color-income)" : "var(--color-expense)",
          }}
        >
          {isIncome ? "+" : "−"}
          {formatVND(tx.amount, true)}
        </p>
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--color-ink-3)",
            marginTop: "2px",
          }}
        >
          {tx.date}
        </p>
      </div>
    </div>
  );
}

// MAIN DASHBOARD COMPONENT
function Dashboard() {
  // State điều khiển hiển thị form
  const [showForm, setShowForm] = useState(false);

  // Khi submit thành công: đóng form, có thể refetch data sau
  const handleTransactionSuccess = () => {
    // TODO Ngày 11: gọi API refetch danh sách giao dịch tại đây
    setTimeout(() => setShowForm(false), 1500); // đóng sau khi hiện success 1.5s
  };

  return (
    <div className="max-w-2xl mx-auto px-5 md:px-8 py-10 md:py-14 space-y-12">
      {/* ===== SECTION 1: Header ===== */}
      <header className="flex items-start justify-between animate-fade-in">
        <div>
          <p className="label-caps mb-2">Tháng Sáu, 2025</p>
          <h1
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "1.125rem",
              fontWeight: 400,
              color: "var(--color-ink-2)",
            }}
          >
            Good morning,{" "}
            <span style={{ color: "var(--color-ink)", fontWeight: 500 }}>
              Huy.
            </span>
          </h1>
        </div>
        {/* Nút mở form */}
        <button
          onClick={() => setShowForm(true)}
          className="btn-ghost flex items-center gap-2 !py-2 !px-3"
        >
          <Plus size={15} />
          <span style={{ fontSize: "0.875rem" }}>Add</span>
        </button>
      </header>

      {/* ===== TRANSACTION FORM (hiện khi showForm = true) ===== */}
      {showForm && (
        <section
          className="opacity-0 animate-fade-up"
          style={{ animationFillMode: "forwards" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "0.75rem",
            }}
          >
            <button
              onClick={() => setShowForm(false)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--color-ink-3)",
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                fontSize: "0.8125rem",
                fontFamily: "var(--font-sans)",
              }}
            >
              <X size={14} /> Đóng
            </button>
          </div>
          <TransactionForm onSuccess={handleTransactionSuccess} />
        </section>
      )}

      {/* ===== SECTION 2: HERO BALANCE ===== */}
      <section
        className="card-subtle rounded-3xl px-8 py-14 text-center relative overflow-hidden opacity-0 animate-fade-up delay-100"
        style={{ animationFillMode: "forwards" }}
      >
        <div
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-[0.07]"
          style={{ backgroundColor: "var(--color-gold)" }}
        />
        <div
          className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full opacity-[0.04]"
          style={{ backgroundColor: "var(--color-gold)" }}
        />
        <p className="label-caps mb-6 relative z-10">Tổng số dư</p>
        <div
          className="relative z-10 opacity-0 animate-number-reveal delay-300"
          style={{ animationFillMode: "forwards" }}
        >
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2.75rem, 8vw, 5rem)",
              fontWeight: 500,
              letterSpacing: "-0.03em",
              lineHeight: 1,
              color: "var(--color-ink)",
              fontFeatureSettings: '"tnum" on',
            }}
          >
            {formatVND(MOCK_BALANCE)}
          </p>
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-5 relative z-10">
          <ArrowUpRight size={14} style={{ color: "var(--color-income)" }} />
          <p style={{ fontSize: "0.875rem", color: "var(--color-ink-2)" }}>
            <span style={{ color: "var(--color-income)", fontWeight: 500 }}>
              +12.3%
            </span>{" "}
            so với tháng trước
          </p>
        </div>
        <div
          className="w-16 h-px mx-auto mt-7 relative z-10"
          style={{ backgroundColor: "var(--color-gold)", opacity: 0.5 }}
        />
      </section>

      {/* ===== SECTION 3: KPI Cards ===== */}
      <section
        className="grid grid-cols-2 gap-4 opacity-0 animate-fade-up delay-200"
        style={{ animationFillMode: "forwards" }}
      >
        <StatCard label="Thu nhập" amount={MOCK_INCOME} isIncome={true} />
        <StatCard label="Chi tiêu" amount={MOCK_EXPENSE} isIncome={false} />
      </section>

      {/* ===== SECTION 4: Budget Progress ===== */}
      <section
        className="opacity-0 animate-fade-up delay-300"
        style={{ animationFillMode: "forwards" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.9375rem",
                fontWeight: 500,
                color: "var(--color-ink)",
              }}
            >
              Ngân sách tháng này
            </h2>
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--color-ink-3)",
                marginTop: "2px",
              }}
            >
              {formatVND(MOCK_EXPENSE, true)} / {formatVND(10_000_000, true)} đã
              chi
            </p>
          </div>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.875rem",
              color: "var(--color-gold)",
              fontWeight: 500,
            }}
          >
            62.3%
          </span>
        </div>
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: "var(--color-bg-subtle)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: "62.3%", backgroundColor: "var(--color-gold)" }}
          />
        </div>
      </section>

      {/* ===== SECTION 5: Recent Transactions ===== */}
      <section
        className="opacity-0 animate-fade-up delay-400"
        style={{ animationFillMode: "forwards" }}
      >
        <div className="flex items-center justify-between mb-1">
          <h2
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.9375rem",
              fontWeight: 500,
              color: "var(--color-ink)",
            }}
          >
            Giao dịch gần đây
          </h2>
          <button
            className="flex items-center gap-1"
            style={{ fontSize: "0.8125rem", color: "var(--color-gold)" }}
          >
            Xem tất cả <ChevronRight size={13} />
          </button>
        </div>
        <div className="mt-2">
          {MOCK_TRANSACTIONS.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
