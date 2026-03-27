/**
 * ============== pages/TestUI.jsx - Trang trình diễn Design System ===============
 * Đây là 'showroom' của toàn bộ UI Components.
 * Không phải trang người dùng thấy - chỉ dùng để dev kiểm tra
 * Mọi component, mọi state, mọi variant đều phải hiện ở đây.
 */
import { useState } from "react";
import {
  Plus,
  Trash2,
  ArrowRight,
  Download,
  ChevronRight,
  Wallet,
  TrendingUp,
  Bell,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

// ============== HELPER: Section wrapper đồng nhất ================
function Section({ title, description, children }) {
  return (
    <section>
      {/* Section header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1.5">
          {/* Vertical accent bar - chi tiết nhỏ tạo sự khác biệt */}
          <div
            className="w-0.5 h-5 rounded-full"
            style={{ backgroundColor: "var(--color-gold)" }}
          />
          <h2
            style={{
              fontFamily: "var(--color-sans)",
              fontSize: "0.8125rem",
              fontWeight: 600,
              letterSpacing: "0.1rem",
              textTransform: "uppercase",
              color: "var(--color-ink-2)",
            }}
          >
            {title}
          </h2>
        </div>
        {description && (
          <p
            style={{
              fontSize: "0.9375rem",
              color: "var(--color-ink-3)",
              paddingLeft: "0.875rem",
            }}
          >
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}

// ============= MAIN TEST UI PAGE ==============
export default function TestUI() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassWord] = useState("");
  const [amount, setAmount] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailOk, setEmailOk] = useState(false);

  // Simulate loading
  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2200);
  };

  // Validate email demo
  const handleEmailBlur = () => {
    if (!email) {
      setEmailError("");
      setEmailOk(false);
      return;
    }
    const valid = /\S+@\S+\.\S+/.test(email);
    setEmailError(valid ? "" : "Định dạng email không hợp lệ");
    setEmailOk(valid);
  };

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100vh" }}>
      {/* ====== TOP BAR ====== */}
      <div
        style={{
          borderBottom: "1px solid var(--color-border)",
          backgroundColor: "var(--color-bg-card)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p
              style={{
                fontFamily: "var(--color-serif)",
                fontSize: "1.125rem",
                fontWeight: 500,
                color: "var(--color-ink)",
              }}
            >
              Hệ thống Design
            </p>
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--color-ink-3)",
                marginTop: "1px",
              }}
            >
              Vault · Quiet Wealth UI Kit
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-gold)",
                backgroundColor: "var(--color-gold-bg, #fdfbf3)",
                border: "1px solid rgba(212,168,67,0.3)",
                padding: "2px 8px",
                borderRadius: "4px",
              }}
            >
              Ngày 5
            </span>
          </div>
        </div>
      </div>

      {/* ========== MAIN CONTENT ========== */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-20">
        {/* SECTION 1: BUTTON */}
        <Section
          title="Nút bấm (Button)"
          description="Năm biến thể, ba kích thước, hai trạng thái đặc biệt"
        >
          {/* Variants */}
          <div className="space-y-6">
            <div>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-ink-3)",
                  marginBottom: "0.75rem",
                  letterSpacing: "0.05em",
                }}
              >
                Biến thể (Variants)
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Lưu thay đổi</Button>
                <Button variant="secondary">Hủy bỏ</Button>
                <Button variant="outline">Xuất báo cáo</Button>
                <Button variant="ghost">Bỏ qua</Button>
                <Button variant="danger" leftIcon={<Trash2 size={14} />}>
                  Xóa giao dịch
                </Button>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-ink-3)",
                  marginBottom: "0/75rem",
                  letterSpacing: "0.05em",
                }}
              >
                Kích thước (Sizes)
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Nhỏ (SM)</Button>
                <Button size="md">Trung bình (MD)</Button>
                <Button size="lg">Lớn (LG)</Button>
              </div>
            </div>

            {/* Icons */}
            <div>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-ink-3)",
                  marginBottom: "0.75rem",
                  letterSpacing: "0.05em",
                }}
              >
                Kết hợp icon
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button leftIcon={<Plus size={15} />}>Thêm giao dịch</Button>
                <Button variant="outline" rightIcon={<ArrowRight size={15} />}>
                  Xem chi tiết
                </Button>
                <Button variant="secondary" leftIcon={<Download size={14} />}>
                  Tải xuống
                </Button>
                <Button variant="ghost" rightIcon={<ChevronRight size={14} />}>
                  Xem tất cả
                </Button>
              </div>
            </div>

            {/* States */}
            <div>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-ink-3)",
                  marginBottom: "0.75rem",
                  letterSpacing: "0.05em",
                }}
              >
                Trạng thái đặc biệt
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button isLoading={isLoading} onClick={handleLoadingDemo}>
                  {isLoading ? "Đang lưu..." : "Nhấn để thử loading"}
                </Button>
                <Button disabled>Không hoạt động</Button>
                <Button variant="outline" disabled>
                  Vô hiệu hóa
                </Button>
              </div>
            </div>
          </div>
        </Section>

        {/* ============ SECTION 2: INPUT ================ */}
        <Section
          title="Ô nhập liệu {Input}"
          description="Tối giản, focus state rõ ràng, xử lý lỗi và thành công inline."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email với validation */}
            <Input
              label="Địa chỉ email"
              type="email"
              placeholder="ban@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
                setEmailOk(false);
              }}
              onBlur={handleEmailBlur}
              error={emailError}
              success={emailOk ? "Email hợp lệ" : ""}
              hint="Nhập email để nhận thông báo giao dịch"
            />

            {/* Password */}
            <Input
              label="Mật khẩu"
              type="password"
              placeholder="Tối thiểu 8 ký tự"
              value={password}
              onChange={(e) => setPassWord(e.target.value)}
              hint="Dùng chữ hoa, số và ký tự đặc biệt"
              required
            />

            {/* Số tiền */}
            <Input
              label="Số tiền giao dịch"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              hint="Đơn vị: VNĐ"
            />

            {/* Error State */}
            <Input
              label="Tên danh mục"
              placeholder="Ví dụ: Ăn uống, Đi lại"
              defaultValue="abc@#$%"
              error="Tên danh mcuj chỉ được chứa chữ cái và số"
            />

            {/* Success State */}
            <Input
              label="Tên người dùng"
              placeholder="Nhập tên của bạn"
              defaultValue="Nguyễn Văn Huy"
              success="Tên hợp lệ và chưa được sử dụng"
            />

            {/* Disabled */}
            <Input
              label="Mã tài khoản"
              defaultValue="VLT-2025-HN-0042"
              disabled
              hint="Mã được tạo tự động, không thể thay đổi"
            />
          </div>
        </Section>

        {/* ============ SECTION 3: CARD VARIANTS ================ */}
        <Section
          title="Thẻ nội dung (Card)"
          description="Compound component - linh hoạt ghép Header, Content, Footer tùy ý."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Default card */}
            <Card variant="default">
              <Card.Header>
                <Card.Title>Số dư tài khoản</Card.Title>
                <Card.Description>Cập nhật lúc 14:32 hôm nay</Card.Description>
              </Card.Header>
              <Card.Content>
                <p
                  style={{
                    fontFamily: "var(--color-serif)",
                    fontSize: "2.25rem",
                    fontWeight: 500,
                    color: "var(--color-ink)",
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                    marginBottom: "0.5rem",
                  }}
                >
                  124.350.000 đ
                </p>
                <p
                  style={{ fontSize: "0.875rem", color: "var(--color-income" }}
                >
                  ↑ +12.3% so với tháng trước
                </p>
              </Card.Content>
              <Card.Footer>
                <Button
                  variant="ghost"
                  size="sm"
                  rightIcon={<ChevronRight size={13} />}
                >
                  Xem lịch sử
                </Button>
              </Card.Footer>
            </Card>

            {/* Subtle card */}
            <Card variant="subtle">
              <Card.Content>
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "var(--color-income-bg)" }}
                  >
                    <TrendingUp
                      size={18}
                      style={{ color: "var(--color-income)" }}
                    />
                  </div>
                  <div>
                    <Card.Title>Thu nhập tháng này</Card.Title>
                    <Card.Description>Tháng Sáu 2025</Card.Description>
                    <p
                      style={{
                        fontFamily: "var(--color-serif)",
                        fontSize: "1.5rem",
                        fontWeight: 500,
                        color: "var(--color-income)",
                        letterSpacing: "-0.02em",
                        marginTop: "0.5rem",
                      }}
                    >
                      18.500.000 đ
                    </p>
                  </div>
                </div>
              </Card.Content>
            </Card>

            {/* Accent Card */}
            <Card variant="accent">
              <Card.Content>
                <div className="flex items-center gap-3 mb-4">
                  <Wallet size={16} style={{ color: "var(--color-gold)" }} />
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--color-gold)",
                    }}
                  >
                    Mục tiêu nổi bật
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "1.125rem",
                    fontWeight: 500,
                    color: "var(--color-ink)",
                    marginBottom: "1rem",
                  }}
                >
                  Quỹ khẩn cấp 6 tháng lương
                </p>
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span
                      style={{
                        fontSize: "0.8125rem",
                        color: "var(--color-ink-2)",
                      }}
                    >
                      72.000.000 / 100.000.000 đ
                    </span>
                    <span
                      style={{
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        fontFamily: "var(--font-mono)",
                        color: "var(--color-gold)",
                      }}
                    >
                      72%
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ backgroundColor: "rgba(212,168,67,0.15)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: "72%",
                        backgroundColor: "var(--color-gold)",
                      }}
                    />
                  </div>
                </div>
              </Card.Content>
            </Card>

            {/* Elevated + interactive card */}
            <Card
              variant="elevated"
              onClick={() => alert("Card có thể click!")}
            >
              <Card.Content>
                <div className="flex items-start justify-between gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "var(--color-subtle)" }}
                  >
                    <Bell size={18} style={{ color: "var(--color-ink-2)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Card.Title>Card có thể nhấn</Card.Title>
                    <Card.Description>
                      Thêm prop{" "}
                      <code
                        style={{
                          fontSize: "0.8125rem",
                          backgroundColor: "var(--color-bg-subtle)",
                          padding: "1px 5px",
                          borderRadius: "4px",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        onClick
                      </code>{" "}
                      để card trở thành interactive.
                    </Card.Description>
                  </div>
                  <ChevronRight
                    size={16}
                    style={{ color: "var(--color-ink-3)", marginTop: "2px" }}
                  />
                </div>
              </Card.Content>
            </Card>
          </div>
        </Section>

        {/* SECTION 4: Typography showcase */}
        <Section
          title="Kiểu chữ (Typography)"
          description="Sự kết hợp Playfair Display (serif) và DM Sans (Sans-serif)."
        >
          <Card variant="subtle">
            <Card.Content>
              <div className="space-y-8">
                {[
                  {
                    label: "Hero — Số dư tổng",
                    font: "serif",
                    size: "3.5rem",
                    weight: 500,
                    ls: "-0.03em",
                    text: "124.350.000 ₫",
                  },
                  {
                    label: "Display — Tiêu đề chính",
                    font: "serif",
                    size: "2.25rem",
                    weight: 500,
                    ls: "-0.02em",
                    text: "Tổng quan tài sản",
                  },
                  {
                    label: "Heading — Tiêu đề mục",
                    font: "serif",
                    size: "1.5rem",
                    weight: 500,
                    ls: "-0.01em",
                    text: "Giao dịch gần đây",
                  },
                  {
                    label: "Body — Văn bản thường",
                    font: "sans",
                    size: "0.9375rem",
                    weight: 400,
                    ls: "0",
                    text: "Theo dõi chi tiêu và quản lý ngân sách hàng tháng một cách thông minh.",
                  },
                  {
                    label: "Label — Nhãn & metadata",
                    font: "sans",
                    size: "0.6875rem",
                    weight: 500,
                    ls: "0.1em",
                    text: "DANH MỤC · ĂN UỐNG",
                    upper: true,
                  },
                  {
                    label: "Mono — Mã giao dịch",
                    font: "mono",
                    size: "0.875rem",
                    weight: 400,
                    ls: "0.02em",
                    text: "TXN-2025-06-00142",
                  },
                ].map(({ label, font, size, weight, ls, text, upper }) => (
                  <div key={label} className="flex gap-6 items-baseline">
                    <p
                      className="shrink-0 w-48"
                      style={{
                        fontSize: "0.6875rem",
                        color: "var(--color-ink-3)",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      {label}
                    </p>
                    <p
                      style={{
                        fontFamily: `var(--font-${font})`,
                        fontSize: size,
                        fontWeight: weight,
                        letterSpacing: ls,
                        color: "var(--color-ink)",
                        textTransform: upper ? "uppercase" : "none",
                        lineHeight: 1.2,
                      }}
                    >
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
        </Section>

        {/* ====================== SECTION 5: Màu sắc ================ */}
        <Section
          title="Bảng màu (Color Palette)"
          description="Quiet Wealth — tối giản, tinh tế."
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                name: "Nền chính",
                bg: "var(--color-bg)",
                text: "var(--color-ink-2)",
              },
              {
                name: "Nền nhạt",
                bg: "var(--color-bg-subtle)",
                text: "var(--color-ink-2)",
              },
              {
                name: "Nền card",
                bg: "var(--color-bg-card)",
                text: "var(--color-ink-2)",
              },
              {
                name: "Viền",
                bg: "var(--color-border)",
                text: "var(--color-ink-2)",
              },
              { name: "Ink (chữ)", bg: "var(--color-ink)", text: "#FAF9F7" },
              { name: "Ink phụ", bg: "var(--color-ink-2)", text: "#FAF9F7" },
              { name: "Gold accent", bg: "var(--color-gold)", text: "#1A1A1A" },
              {
                name: "Gold nhạt",
                bg: "var(--color-gold-light)",
                text: "#6F5016",
              },
              { name: "Thu nhập", bg: "var(--color-income)", text: "#FFFFFF" },
              {
                name: "Nền thu nhập",
                bg: "var(--color-income-bg)",
                text: "var(--color-income)",
              },
              { name: "Chi tiêu", bg: "var(--color-expense)", text: "#FFFFFF" },
              {
                name: "Nền chi tiêu",
                bg: "var(--color-expense-bg)",
                text: "var(--color-expense)",
              },
            ].map(({ name, bg, text }) => (
              <div
                key={name}
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid var(--color-border)" }}
              >
                <div className="h-14" style={{ backgroundColor: bg }} />
                <div
                  className="px-3 py-2"
                  style={{ backgroundColor: "var(--color-bg-card)" }}
                >
                  <p
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      color: "var(--color-ink)",
                    }}
                  >
                    {name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
