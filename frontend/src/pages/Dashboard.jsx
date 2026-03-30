// =============================================
// pages/Dashboard.jsx — Ngày 11
// =============================================
// Tích hợp TransactionFilter + TransactionTable
// với getTransactions API. Form từ Ngày 10 vẫn giữ nguyên.

import { useState, useEffect, useCallback } from "react";
import { ArrowUpRight, ArrowDownRight, Plus, X } from "lucide-react";
import TransactionForm from "@/components/transactions/TransactionForm";
import TransactionFilter from "@/components/transactions/TransactionFilter";
import TransactionTable from "@/components/transactions/TransactionTable";
import Card from "@/components/ui/Card";
import { getTransactions } from "@/api/transactionApi";

// =============================================
// MOCK DATA — Hero section (static, chưa kết nối API)
// =============================================
const MOCK_BALANCE = 124_350_000;
const MOCK_INCOME = 18_500_000;
const MOCK_EXPENSE = 6_230_000;

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

// =============================================
// MAIN DASHBOARD COMPONENT
// =============================================
function Dashboard() {
  const now = new Date();

  // ---- Form state ----
  const [showForm, setShowForm] = useState(false);

  // ---- Filter state — mặc định tháng/năm hiện tại ----
  const [filters, setFilters] = useState({
    month: now.getMonth() + 1, // getMonth() trả 0-indexed
    year: now.getFullYear(),
    type: "all",
  });

  // ---- Transaction data ----
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // =============================================
  // TỐI ƯU (Junior): useEffect + dependency array để tự động gọi lại API
  // khi filter thay đổi — không cần nút "Tìm kiếm".
  // -----------------------------------------------------------
  // Cách hoạt động:
  //   1. User chọn "Tháng 5" -> filters.month thay đổi
  //   2. React phát hiện [filters] thay đổi -> chạy lại useEffect
  //   3. fetchTransactions() được gọi với params mới
  //   4. Bảng tự cập nhật — không cần bấm nút
  //
  // Có nên thêm debounce không?
  //   - Với dropdown (Select), KHÔNG cần debounce — mỗi lần chọn chỉ
  //     kích hoạt 1 API call, không liên tục như typing vào input.
  //   - Debounce cần thiết khi filter là text input (search box):
  //     VD: user gõ "ăn" -> "ăn u" -> "ăn uố" mỗi keystroke đều gọi API
  //     -> debounce 300ms để chờ user gõ xong mới gọi.
  //   - Nếu sau này thêm ô tìm kiếm theo tên giao dịch, hãy dùng:
  //     useEffect(() => { const timer = setTimeout(fetch, 300); return () => clearTimeout(timer); }, [searchText])
  // =============================================
  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);

    try {
      // Chỉ truyền type vào params khi không phải "all"
      // Backend chỉ hiểu "income" / "expense", không hiểu "all"
      const params = {
        month: filters.month,
        year: filters.year,
        limit: 50,
        ...(filters.type !== "all" && { type: filters.type }),
      };

      const res = await getTransactions(params);
      setTransactions(res.data || []);
      setSummary(res.summary || null);
    } catch (err) {
      setFetchError("Không thể tải danh sách giao dịch. Vui lòng thử lại.");
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]); // Re-run bất cứ khi nào filters thay đổi

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Khi tạo giao dịch thành công: đóng form + refetch
  const handleTransactionSuccess = () => {
    setTimeout(() => {
      setShowForm(false);
      fetchTransactions(); // Cập nhật bảng ngay sau khi thêm mới
    }, 1200);
  };

  // =============================================
  // Tên tháng tiếng Việt cho section title
  // =============================================
  const monthLabel = new Date(
    filters.year,
    filters.month - 1,
    1,
  ).toLocaleDateString("vi-VN", { month: "long", year: "numeric" });

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 py-10 md:py-14 space-y-10">
      {/* ===== HEADER ===== */}
      <header className="flex items-start justify-between animate-fade-in">
        <div>
          <p className="label-caps mb-2">
            {new Date().toLocaleDateString("vi-VN", {
              month: "long",
              year: "numeric",
            })}
          </p>
          <h1
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "1.125rem",
              fontWeight: 400,
              color: "var(--color-ink-2)",
            }}
          >
            Xin chào,{" "}
            <span style={{ color: "var(--color-ink)", fontWeight: 500 }}>
              Huy.
            </span>
          </h1>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="btn-ghost flex items-center gap-2 !py-2 !px-3"
        >
          {showForm ? <X size={15} /> : <Plus size={15} />}
          <span style={{ fontSize: "0.875rem" }}>
            {showForm ? "Đóng" : "Thêm"}
          </span>
        </button>
      </header>

      {/* ===== FORM (slide in) ===== */}
      {showForm && (
        <section
          className="opacity-0 animate-fade-up"
          style={{ animationFillMode: "forwards" }}
        >
          <TransactionForm onSuccess={handleTransactionSuccess} />
        </section>
      )}

      {/* ===== HERO BALANCE ===== */}
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

      {/* ===== KPI Cards ===== */}
      <section
        className="grid grid-cols-2 gap-4 opacity-0 animate-fade-up delay-200"
        style={{ animationFillMode: "forwards" }}
      >
        <StatCard label="Thu nhập" amount={MOCK_INCOME} isIncome={true} />
        <StatCard label="Chi tiêu" amount={MOCK_EXPENSE} isIncome={false} />
      </section>

      {/* ===== TRANSACTION SECTION — Filter + Table trong Card ===== */}
      <section
        className="opacity-0 animate-fade-up delay-300"
        style={{ animationFillMode: "forwards" }}
      >
        <Card variant="default" radius="lg" style={{ overflow: "hidden" }}>
          {/* Card Header: Tiêu đề + Filter */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1.25rem 1.5rem",
              borderBottom: "1px solid var(--color-border)",
              flexWrap: "wrap",
              gap: "1rem",
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
                Lịch sử
              </p>
              <h2
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.125rem",
                  fontWeight: 500,
                  color: "var(--color-ink)",
                  letterSpacing: "-0.015em",
                }}
              >
                {monthLabel}
              </h2>
            </div>
            <TransactionFilter filters={filters} onFilterChange={setFilters} />
          </div>

          {/* Error state */}
          {fetchError && (
            <div
              style={{
                padding: "0.875rem 1.5rem",
                backgroundColor: "var(--color-expense-bg)",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <p
                style={{ fontSize: "0.875rem", color: "var(--color-expense)" }}
              >
                {fetchError}
              </p>
            </div>
          )}

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <TransactionTable
              transactions={transactions}
              isLoading={isLoading}
              summary={summary}
            />
          </div>
        </Card>
      </section>
    </div>
  );
}

export default Dashboard;
