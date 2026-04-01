// =============================================
// components/budgets/BudgetForm.jsx
// =============================================
// Form đặt hạn mức chi tiêu — tối giản, không ồn ào.
// Không ai muốn nhìn vào một form ngân sách đáng sợ.
// Thiết kế như tờ lệnh thanh toán của một private banker.

import { useState, useEffect } from "react";
import { Select, SelectItem } from "@tremor/react";
import { CheckCircle2, AlertCircle, PiggyBank } from "lucide-react";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { getCategories } from "@/api/categoryApi";
import { createBudget } from "@/api/budgetApi";

// =============================================
// CONSTANTS
// =============================================
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

const now = new Date();
const INITIAL_FORM = {
  categoryId: "",
  amount: "",
  month: String(now.getMonth() + 1),
  year: String(now.getFullYear()),
};

// Tremor Select override — Quiet Wealth style
const SELECT_CLASS = [
  "[&>button]:border-[var(--color-border)]",
  "[&>button]:rounded-[8px]",
  "[&>button]:bg-[var(--color-bg-subtle)]",
  "[&>button]:text-[var(--color-ink)]",
  "[&>button]:text-[0.9375rem]",
  "[&>button]:h-[50px]",
  "[&>button]:px-4",
  "[&>button:focus]:border-[var(--color-gold)]",
  "[&>button:focus]:shadow-[0_0_0_3px_rgba(212,168,67,0.12)]",
  "[&>button:focus]:bg-[var(--color-bg-card)]",
  "[&>div]:border-[var(--color-border)]",
  "[&>div]:rounded-[10px]",
  "[&>div]:shadow-[0_8px_24px_rgba(26,26,26,0.1)]",
  "[&>div]:bg-[var(--color-bg-card)]",
].join(" ");

const SELECT_SM_CLASS = SELECT_CLASS.replace(/h-\[50px\]/g, "h-9").replace(
  /text-\[0.9375rem\]/g,
  "text-[0.875rem]",
);

// =============================================
// MAIN COMPONENT
// =============================================
function BudgetForm({ onSuccess }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // "success" | "error" | null
  const [statusMsg, setStatusMsg] = useState("");
  const [errors, setErrors] = useState({});

  // Chỉ lấy category type "expense" — budget chỉ áp dụng cho chi tiêu
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getCategories();
        setCategories((res.data || []).filter((c) => c.type === "expense"));
      } catch {
        setCategories([]);
      } finally {
        setLoadingCats(false);
      }
    };
    fetch();
  }, []);

  const handleField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.categoryId) errs.categoryId = "Vui lòng chọn danh mục";
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      errs.amount = "Vui lòng nhập hạn mức hợp lệ (lớn hơn 0)";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      await createBudget({
        category: form.categoryId,
        amount: Number(form.amount),
        month: Number(form.month),
        year: Number(form.year),
      });
      setStatus("success");
      setStatusMsg("Đã thiết lập hạn mức thành công!");
      setForm(INITIAL_FORM);
      setErrors({});
      if (typeof onSuccess === "function") onSuccess();
      setTimeout(() => setStatus(null), 3500);
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại.";
      setStatus("error");
      setStatusMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card variant="default" radius="lg">
      <form onSubmit={handleSubmit} noValidate>
        {/* ===== HEADER ===== */}
        <div style={{ padding: "1.5rem 1.75rem 1.25rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              marginBottom: "0.25rem",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                backgroundColor: "var(--color-ink)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <PiggyBank size={13} style={{ color: "var(--color-gold)" }} />
            </div>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.125rem",
                fontWeight: 500,
                color: "var(--color-ink)",
                letterSpacing: "-0.015em",
              }}
            >
              Thiết lập hạn mức
            </p>
          </div>
          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--color-ink-3)",
              paddingLeft: "2.375rem",
            }}
          >
            Đặt giới hạn chi tiêu cho từng danh mục mỗi tháng
          </p>
        </div>

        <Card.Content style={{ padding: "0 1.75rem 1.25rem" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.125rem",
            }}
          >
            {/* Status banner */}
            {status && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                  padding: "0.75rem 0.875rem",
                  backgroundColor:
                    status === "success"
                      ? "var(--color-income-bg)"
                      : "var(--color-expense-bg)",
                  border: `1px solid ${status === "success" ? "rgba(61,107,90,0.2)" : "rgba(139,74,58,0.2)"}`,
                  borderRadius: "8px",
                  animation: "fadeIn 0.25s ease both",
                }}
              >
                {status === "success" ? (
                  <CheckCircle2
                    size={15}
                    style={{
                      color: "var(--color-income)",
                      flexShrink: 0,
                      marginTop: "1px",
                    }}
                  />
                ) : (
                  <AlertCircle
                    size={15}
                    style={{
                      color: "var(--color-expense)",
                      flexShrink: 0,
                      marginTop: "1px",
                    }}
                  />
                )}
                <p
                  style={{
                    fontSize: "0.875rem",
                    color:
                      status === "success"
                        ? "var(--color-income)"
                        : "var(--color-expense)",
                    lineHeight: 1.4,
                  }}
                >
                  {statusMsg}
                </p>
              </div>
            )}

            {/* Danh mục */}
            <div>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.6875rem",
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-ink-2)",
                  marginBottom: "0.375rem",
                }}
              >
                Danh mục <span style={{ color: "var(--color-gold)" }}>*</span>
              </p>
              <Select
                value={form.categoryId}
                onValueChange={(v) => handleField("categoryId", v)}
                placeholder={
                  loadingCats ? "Đang tải..." : "Chọn danh mục chi tiêu"
                }
                disabled={loadingCats}
                className={SELECT_CLASS}
              >
                {categories.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </Select>
              {errors.categoryId && (
                <p
                  style={{
                    marginTop: "0.375rem",
                    fontSize: "0.8125rem",
                    color: "var(--color-expense)",
                  }}
                >
                  {errors.categoryId}
                </p>
              )}
            </div>

            {/* Hạn mức */}
            <div>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.6875rem",
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-ink-2)",
                  marginBottom: "0.375rem",
                }}
              >
                Hạn mức <span style={{ color: "var(--color-gold)" }}>*</span>
              </p>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  placeholder="0"
                  value={form.amount}
                  onChange={(e) => handleField("amount", e.target.value)}
                  min="1"
                  style={{
                    width: "100%",
                    fontFamily: "var(--font-serif)",
                    fontSize: "1.5rem",
                    fontWeight: 500,
                    letterSpacing: "-0.02em",
                    color: errors.amount
                      ? "var(--color-expense)"
                      : "var(--color-ink)",
                    backgroundColor: "var(--color-bg-subtle)",
                    border: `1px solid ${errors.amount ? "var(--color-expense)" : "var(--color-border)"}`,
                    borderRadius: "8px",
                    padding: "0.75rem 3rem 0.75rem 0.875rem",
                    outline: "none",
                    transition: "all 0.2s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--color-gold)";
                    e.target.style.backgroundColor = "var(--color-bg-card)";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(212,168,67,0.12)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.amount
                      ? "var(--color-expense)"
                      : "var(--color-border)";
                    e.target.style.backgroundColor = "var(--color-bg-subtle)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    right: "0.875rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontFamily: "var(--font-serif)",
                    fontSize: "1.125rem",
                    color: "var(--color-ink-3)",
                    pointerEvents: "none",
                  }}
                >
                  ₫
                </span>
              </div>
              {errors.amount && (
                <p
                  style={{
                    marginTop: "0.375rem",
                    fontSize: "0.8125rem",
                    color: "var(--color-expense)",
                  }}
                >
                  {errors.amount}
                </p>
              )}
            </div>

            {/* Tháng + Năm — 2 cột */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.6875rem",
                    fontWeight: 500,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--color-ink-2)",
                    marginBottom: "0.375rem",
                  }}
                >
                  Tháng
                </p>
                <Select
                  value={form.month}
                  onValueChange={(v) => handleField("month", v)}
                  className={SELECT_SM_CLASS}
                >
                  {MONTHS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.6875rem",
                    fontWeight: 500,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--color-ink-2)",
                    marginBottom: "0.375rem",
                  }}
                >
                  Năm
                </p>
                <Select
                  value={form.year}
                  onValueChange={(v) => handleField("year", v)}
                  className={SELECT_SM_CLASS}
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
        </Card.Content>

        {/* ===== FOOTER ===== */}
        <Card.Footer
          style={{
            padding: "1rem 1.75rem",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Đang lưu..." : "Lưu hạn mức"}
          </Button>
        </Card.Footer>
      </form>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </Card>
  );
}

export default BudgetForm;
