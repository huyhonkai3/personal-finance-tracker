// =============================================
// pages/Dashboard.jsx — Ngày 16
// =============================================
// Thay thế MOCK_BALANCE / MOCK_INCOME / MOCK_EXPENSE
// bằng DashboardMetrics component kết nối API thực.

import { useState, useEffect, useCallback } from "react";
import { Plus, X } from "lucide-react";
import TransactionForm from "@/components/transactions/TransactionForm";
import TransactionFilter from "@/components/transactions/TransactionFilter";
import TransactionTable from "@/components/transactions/TransactionTable";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics"; // MỚI
import Card from "@/components/ui/Card";
import { getTransactions } from "@/api/transactionApi";

// =============================================
// MAIN DASHBOARD COMPONENT
// =============================================
function Dashboard() {
  const now = new Date();

  // ---- Form state ----
  const [showForm, setShowForm] = useState(false);

  // ---- Filter state ----
  const [filters, setFilters] = useState({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    type: "all",
  });

  // ---- Transaction data ----
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const params = {
        month: filters.month,
        year: filters.year,
        limit: 50,
        ...(filters.type !== "all" && { type: filters.type }),
      };
      const res = await getTransactions(params);
      setTransactions(res.data || []);
      setSummary(res.summary || null);
    } catch {
      setFetchError("Không thể tải danh sách giao dịch. Vui lòng thử lại.");
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleTransactionSuccess = () => {
    setTimeout(() => {
      setShowForm(false);
      fetchTransactions();
    }, 1200);
  };

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

      {/* ===== FORM ===== */}
      {showForm && (
        <section
          className="opacity-0 animate-fade-up"
          style={{ animationFillMode: "forwards" }}
        >
          <TransactionForm onSuccess={handleTransactionSuccess} />
        </section>
      )}

      {/* ===== DASHBOARD METRICS (thay thế toàn bộ MOCK hero + stat cards) =====
        DashboardMetrics tự fetch API getTransactionSummary với month/year.
        Khi filters thay đổi (user chọn tháng khác ở bảng bên dưới),
        truyền xuống để Metrics cũng cập nhật theo — dữ liệu đồng bộ.
      */}
      <section
        className="opacity-0 animate-fade-up delay-100"
        style={{ animationFillMode: "forwards" }}
      >
        <DashboardMetrics month={filters.month} year={filters.year} />
      </section>

      {/* ===== TRANSACTION SECTION ===== */}
      <section
        className="opacity-0 animate-fade-up delay-200"
        style={{ animationFillMode: "forwards" }}
      >
        <Card variant="default" radius="lg" style={{ overflow: "hidden" }}>
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
            {/* TransactionFilter cũng điều khiển tháng/năm của Metrics */}
            <TransactionFilter filters={filters} onFilterChange={setFilters} />
          </div>

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
