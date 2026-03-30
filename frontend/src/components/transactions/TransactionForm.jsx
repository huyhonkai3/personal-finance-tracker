// =============================================
// components/transactions/TransactionForm.jsx
// =============================================
// Thiết kế: "Quiet Wealth" — form tài chính không phải bảng khai thuế.
// Không gian âm rộng rãi. Từng trường được thở. Mỗi lần nhập là một hành động
// có chủ đích, không phải gánh nặng.

import { useState, useEffect } from "react";
import { Select, SelectItem, DatePicker } from "@tremor/react";
import {
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { getCategories } from "@/api/categoryApi";
import { createTransaction } from "@/api/transactionApi";

// =============================================
// CONSTANTS
// =============================================
const TRANSACTION_TYPES = [
  {
    value: "income",
    label: "Thu nhập",
    icon: ArrowUpRight,
    color: "var(--color-income)",
  },
  {
    value: "expense",
    label: "Chi tiêu",
    icon: ArrowDownRight,
    color: "var(--color-expense)",
  },
];

const INITIAL_FORM = {
  amount: "",
  type: "expense",
  categoryId: "",
  date: new Date(),
  note: "",
};

// =============================================
// SUB-COMPONENT: TypeToggle — Nút chọn Thu/Chi
// =============================================
// Thay Select dropdown bằng toggle 2 nút — rõ ràng hơn, ít click hơn.
// Đây là lựa chọn UX chủ đích: 2 options không cần dropdown.
function TypeToggle({ value, onChange }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "0.5rem",
        padding: "0.25rem",
        backgroundColor: "var(--color-bg-subtle)",
        borderRadius: "10px",
        border: "1px solid var(--color-border)",
      }}
    >
      {TRANSACTION_TYPES.map(({ value: v, label, icon: Icon, color }) => {
        const isActive = value === v;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.625rem 1rem",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              fontSize: "0.875rem",
              fontWeight: isActive ? 600 : 400,
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              backgroundColor: isActive
                ? "var(--color-bg-card)"
                : "transparent",
              color: isActive ? color : "var(--color-ink-3)",
              boxShadow: isActive
                ? "0 1px 4px rgba(26,26,26,0.08), 0 0 0 1px rgba(26,26,26,0.06)"
                : "none",
            }}
          >
            <Icon
              size={15}
              strokeWidth={isActive ? 2.25 : 1.75}
              style={{
                color: isActive ? color : "var(--color-ink-3)",
                transition: "color 0.2s",
              }}
            />
            {label}
          </button>
        );
      })}
    </div>
  );
}

// =============================================
// SUB-COMPONENT: SuccessToast — Thông báo nhỏ khi thành công
// =============================================
function StatusBanner({ status, message, onDismiss }) {
  if (!status) return null;
  const isSuccess = status === "success";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.625rem",
        padding: "0.75rem 1rem",
        borderRadius: "8px",
        backgroundColor: isSuccess
          ? "var(--color-income-bg)"
          : "var(--color-expense-bg)",
        border: `1px solid ${isSuccess ? "rgba(61,107,90,0.2)" : "rgba(139,74,58,0.2)"}`,
        animation: "fadeSlideIn 0.3s cubic-bezier(0.16,1,0.3,1) both",
      }}
    >
      {isSuccess ? (
        <CheckCircle2
          size={15}
          style={{ color: "var(--color-income)", flexShrink: 0 }}
        />
      ) : (
        <AlertCircle
          size={15}
          style={{ color: "var(--color-expense)", flexShrink: 0 }}
        />
      )}
      <p
        style={{
          flex: 1,
          fontSize: "0.875rem",
          color: isSuccess ? "var(--color-income)" : "var(--color-expense)",
          fontFamily: "var(--font-sans)",
        }}
      >
        {message}
      </p>
      <button
        onClick={onDismiss}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: isSuccess ? "var(--color-income)" : "var(--color-expense)",
          opacity: 0.6,
          fontSize: "1rem",
          lineHeight: 1,
          padding: "0 2px",
        }}
      >
        ×
      </button>
    </div>
  );
}

// =============================================
// MAIN COMPONENT
// =============================================
function TransactionForm({ onSuccess }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [allCategories, setAllCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // null | "success" | "error"
  const [statusMsg, setStatusMsg] = useState("");
  const [errors, setErrors] = useState({});

  // ---- Fetch categories khi mount ----
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        setAllCategories(res.data || []);
      } catch {
        // Không block form nếu category lỗi
        setAllCategories([]);
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCategories();
  }, []);

  // TỐI ƯU (Junior): Filter động danh sách Category theo Type đang chọn
  // -----------------------------------------------------------
  // `allCategories` luôn chứa TẤT CẢ danh mục (income + expense).
  // Thay vì gọi API lại mỗi khi user đổi type, ta lọc client-side:
  //
  //   filteredCategories = allCategories.filter(cat => cat.type === form.type)
  //
  // Tại sao không gọi API mỗi lần? Vì:
  //   1. Giảm số lần gọi mạng không cần thiết (UX nhanh hơn)
  //   2. Data đã có sẵn ở client — không cần đi lại server
  //
  // Side effect quan trọng: Khi user đổi type, categoryId cũ có thể
  // không còn hợp lệ (ví dụ: đổi từ expense sang income, category "Ăn uống"
  // không có trong income). Vì vậy phải reset categoryId về "" khi đổi type.
  const filteredCategories = allCategories.filter(
    (cat) => cat.type === form.type,
  );

  // ---- Handlers ----
  const handleTypeChange = (newType) => {
    setForm((prev) => ({ ...prev, type: newType, categoryId: "" })); // reset category khi đổi type
    setErrors((prev) => ({ ...prev, categoryId: "" }));
  };

  const handleField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (
      !form.amount ||
      isNaN(Number(form.amount)) ||
      Number(form.amount) <= 0
    ) {
      errs.amount = "Vui lòng nhập số tiền hợp lệ (lớn hơn 0)";
    }
    if (!form.categoryId) {
      errs.categoryId = "Vui lòng chọn danh mục";
    }
    if (!form.date) {
      errs.date = "Vui lòng chọn ngày giao dịch";
    }
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
      await createTransaction({
        amount: Number(form.amount),
        type: form.type,
        categoryId: form.categoryId,
        // Tremor DatePicker trả về JS Date object — format thành ISO string cho backend
        date: form.date instanceof Date ? form.date.toISOString() : form.date,
        note: form.note.trim(),
      });

      setStatus("success");
      setStatusMsg("Giao dịch đã được ghi lại thành công!");
      setForm(INITIAL_FORM);
      setErrors({});
      // Gọi callback để parent (Dashboard) biết để refresh danh sách
      if (typeof onSuccess === "function") onSuccess();

      // Tự ẩn thông báo sau 4 giây
      setTimeout(() => setStatus(null), 4000);
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại.";
      setStatus("error");
      setStatusMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =============================================
  // TREMOR OVERRIDE CLASSES
  // Tremor Select/DatePicker mặc định có border xanh dương và radius to
  // Override lại để khớp với Quiet Wealth design system
  // =============================================
  const tremorSelectClass = [
    // Border mỏng, màu neutral — không tranh chú ý
    "[&>button]:border-[var(--color-border)]",
    "[&>button]:rounded-[8px]",
    "[&>button]:bg-[var(--color-bg-subtle)]",
    "[&>button]:text-[var(--color-ink)]",
    "[&>button]:text-[0.9375rem]",
    "[&>button]:h-[50px]", // khớp chiều cao với Input component
    "[&>button]:px-4",
    "[&>button:focus]:border-[var(--color-gold)]",
    "[&>button:focus]:shadow-[0_0_0_3px_rgba(212,168,67,0.12)]",
    "[&>button:focus]:bg-[var(--color-bg-card)]",
    // Dropdown panel
    "[&>div]:border-[var(--color-border)]",
    "[&>div]:rounded-[10px]",
    "[&>div]:shadow-[0_8px_32px_rgba(26,26,26,0.1)]",
  ].join(" ");

  const tremorDateClass = [
    "[&>div>input]:border-[var(--color-border)]",
    "[&>div>input]:rounded-[8px]",
    "[&>div>input]:bg-[var(--color-bg-subtle)]",
    "[&>div>input]:text-[var(--color-ink)]",
    "[&>div>input]:text-[0.9375rem]",
    "[&>div>input]:h-[50px]",
    "[&>div>input]:px-4",
    "[&>div>input:focus]:border-[var(--color-gold)]",
    "[&>div>input:focus]:shadow-[0_0_0_3px_rgba(212,168,67,0.12)]",
    "[&>div]:rounded-[8px]",
  ].join(" ");

  // Màu accent theo type đang chọn
  const activeColor =
    form.type === "income" ? "var(--color-income)" : "var(--color-expense)";

  return (
    <>
      {/* Keyframe animation cho status banner */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <Card variant="default" radius="lg" style={{ overflow: "visible" }}>
        <form onSubmit={handleSubmit} noValidate>
          {/* ===== HEADER ===== */}
          <div style={{ padding: "1.75rem 2rem 0" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: "1.5rem",
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
                    marginBottom: "0.375rem",
                  }}
                >
                  Giao dịch mới
                </p>
                <h2
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "1.375rem",
                    fontWeight: 500,
                    color: "var(--color-ink)",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                  }}
                >
                  Ghi nhận dòng tiền
                </h2>
              </div>
              {/* Dot indicator màu theo type */}
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: activeColor,
                  marginTop: "6px",
                  boxShadow: `0 0 0 3px ${form.type === "income" ? "rgba(61,107,90,0.15)" : "rgba(139,74,58,0.15)"}`,
                  transition: "all 0.3s ease",
                }}
              />
            </div>

            {/* Type Toggle */}
            <TypeToggle value={form.type} onChange={handleTypeChange} />
          </div>

          {/* ===== BODY ===== */}
          <Card.Content style={{ padding: "1.5rem 2rem" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              {/* Status Banner */}
              <StatusBanner
                status={status}
                message={statusMsg}
                onDismiss={() => setStatus(null)}
              />

              {/* Số tiền — input nổi bật nhất */}
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
                  Số tiền <span style={{ color: "var(--color-gold)" }}>*</span>
                </p>
                {/* Wrapper có suffix "₫" */}
                <div style={{ position: "relative" }}>
                  <input
                    type="number"
                    placeholder="0"
                    value={form.amount}
                    onChange={(e) => handleField("amount", e.target.value)}
                    min="1"
                    style={{
                      width: "100%",
                      paddingRight: "3rem",
                      // Kiểu chữ lớn cho số tiền — tạo trọng tâm thị giác
                      fontFamily: "var(--font-serif)",
                      fontSize: "1.75rem",
                      fontWeight: 500,
                      letterSpacing: "-0.02em",
                      color: errors.amount
                        ? "var(--color-expense)"
                        : activeColor,
                      backgroundColor: "var(--color-bg-subtle)",
                      border: `1px solid ${errors.amount ? "var(--color-expense)" : "var(--color-border)"}`,
                      borderRadius: "8px",
                      padding: "0.875rem 3.5rem 0.875rem 1rem",
                      outline: "none",
                      transition: "all 0.2s ease",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = errors.amount
                        ? "var(--color-expense)"
                        : "var(--color-gold)";
                      e.target.style.backgroundColor = "var(--color-bg-card)";
                      e.target.style.boxShadow = errors.amount
                        ? "0 0 0 3px rgba(139,74,58,0.1)"
                        : "0 0 0 3px rgba(212,168,67,0.12)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.amount
                        ? "var(--color-expense)"
                        : "var(--color-border)";
                      e.target.style.backgroundColor = "var(--color-bg-subtle)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  {/* Currency suffix */}
                  <span
                    style={{
                      position: "absolute",
                      right: "1rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontFamily: "var(--font-serif)",
                      fontSize: "1.25rem",
                      fontWeight: 500,
                      color: "var(--color-ink-3)",
                      pointerEvents: "none",
                      transition: "color 0.2s",
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

              {/* 2 cột: Danh mục + Ngày */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
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
                    Danh mục{" "}
                    <span style={{ color: "var(--color-gold)" }}>*</span>
                  </p>
                  <Select
                    value={form.categoryId}
                    onValueChange={(v) => handleField("categoryId", v)}
                    placeholder={loadingCats ? "Đang tải..." : "Chọn danh mục"}
                    disabled={loadingCats}
                    className={tremorSelectClass}
                  >
                    {filteredCategories.length === 0 && !loadingCats ? (
                      <SelectItem value="" disabled>
                        Không có danh mục
                      </SelectItem>
                    ) : (
                      filteredCategories.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))
                    )}
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

                {/* Ngày */}
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
                    Ngày <span style={{ color: "var(--color-gold)" }}>*</span>
                  </p>
                  <DatePicker
                    value={form.date}
                    onValueChange={(d) => handleField("date", d)}
                    placeholder="Chọn ngày"
                    locale="vi"
                    className={tremorDateClass}
                  />
                  {errors.date && (
                    <p
                      style={{
                        marginTop: "0.375rem",
                        fontSize: "0.8125rem",
                        color: "var(--color-expense)",
                      }}
                    >
                      {errors.date}
                    </p>
                  )}
                </div>
              </div>

              {/* Ghi chú */}
              <Input
                label="Ghi chú"
                placeholder="Thêm ghi chú cho giao dịch này..."
                value={form.note}
                onChange={(e) => handleField("note", e.target.value)}
                hint="Không bắt buộc · Tối đa 500 ký tự"
                maxLength={500}
              />
            </div>
          </Card.Content>

          {/* ===== FOOTER ===== */}
          <Card.Footer
            style={{
              borderTop: "1px solid var(--color-border)",
              padding: "1.25rem 2rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
              }}
            >
              {/* Preview số tiền nhỏ — visual confirmation trước khi submit */}
              <div>
                {form.amount && Number(form.amount) > 0 ? (
                  <>
                    <p
                      style={{
                        fontSize: "0.6875rem",
                        color: "var(--color-ink-3)",
                        marginBottom: "1px",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      Sắp ghi nhận
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.9375rem",
                        fontWeight: 500,
                        color: activeColor,
                      }}
                    >
                      {form.type === "income" ? "+" : "−"}
                      {Number(form.amount).toLocaleString("vi-VN")} ₫
                    </p>
                  </>
                ) : (
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--color-ink-3)",
                    }}
                  >
                    Nhập số tiền để xem xem trước
                  </p>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  alignItems: "center",
                }}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setForm(INITIAL_FORM);
                    setErrors({});
                    setStatus(null);
                  }}
                  disabled={isSubmitting}
                >
                  Đặt lại
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  style={
                    !isSubmitting
                      ? {
                          // Nút đổi màu theo type đang chọn — visual feedback tinh tế
                          backgroundColor:
                            form.type === "income"
                              ? "var(--color-income)"
                              : "var(--color-ink)",
                          borderColor:
                            form.type === "income"
                              ? "var(--color-income)"
                              : "var(--color-ink)",
                          transition:
                            "background-color 0.3s ease, border-color 0.3s ease",
                        }
                      : {}
                  }
                >
                  {isSubmitting ? "Đang lưu..." : "Lưu giao dịch"}
                </Button>
              </div>
            </div>
          </Card.Footer>
        </form>
      </Card>
    </>
  );
}

export default TransactionForm;
