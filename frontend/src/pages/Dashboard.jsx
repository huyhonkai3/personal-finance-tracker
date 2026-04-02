// =============================================
// pages/Dashboard.jsx — Ngày 18
// =============================================

import { useState, useEffect, useCallback } from "react";
import { Plus, X } from "lucide-react";
import TransactionForm from "@/components/transactions/TransactionForm";
import TransactionFilter from "@/components/transactions/TransactionFilter";
import TransactionTable from "@/components/transactions/TransactionTable";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import ExpenseDonutChart from "@/components/dashboard/ExpenseDonutChart";
import MonthlyTrendChart from "@/components/dashboard/MonthlyTrendChart"; // MỚI
import Card from "@/components/ui/Card";
import { getTransactions } from "@/api/transactionApi";

function Dashboard() {
  const now = new Date();

  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    type: "all",
  });
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [chartsRefreshKey, setChartsRefreshKey] = useState(0);

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
      setChartsRefreshKey((k) => k + 1); // trigger tất cả chart refetch
    }, 1200);
  };

  const monthLabel = new Date(
    filters.year,
    filters.month - 1,
    1,
  ).toLocaleDateString("vi-VN", { month: "long", year: "numeric" });

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 py-10 md:py-14 space-y-10">
      {/* HEADER */}
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

      {/* FORM */}
      {showForm && (
        <section
          className="opacity-0 animate-fade-up"
          style={{ animationFillMode: "forwards" }}
        >
          <TransactionForm onSuccess={handleTransactionSuccess} />
        </section>
      )}

      {/* METRICS */}
      <section
        className="opacity-0 animate-fade-up delay-100"
        style={{ animationFillMode: "forwards" }}
      >
        <DashboardMetrics
          month={filters.month}
          year={filters.year}
          refreshKey={chartsRefreshKey}
        />
      </section>

      {/* CHARTS ROW — Donut (1/3) + Trend (2/3) */}
      <section
        className="opacity-0 animate-fade-up delay-200"
        style={{ animationFillMode: "forwards" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: "1rem",
          }}
          className="charts-row"
        >
          {/* Donut Chart — chi tiêu theo danh mục tháng này */}
          <ExpenseDonutChart
            month={filters.month}
            year={filters.year}
            refreshKey={chartsRefreshKey}
          />

          {/* Monthly Trend Chart — xu hướng cả năm */}
          <MonthlyTrendChart
            year={filters.year}
            refreshKey={chartsRefreshKey}
          />
        </div>
      </section>

      {/* TRANSACTION TABLE */}
      <section
        className="opacity-0 animate-fade-up delay-300"
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

      <style>{`
        @media (max-width: 640px) {
          .charts-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
