// =============================================
// tailwind.config.js - Design System "Quiet Wealth"
// =============================================
// Triết lý thiết kế: "Quiet Wealth" - Sự tĩnh lặng của tài sản
// Không khoa trương, không lòe loẹt. Typography dẫn dắt, màu sắc phục vụ.

/** @type {import('tailwindcss').Config} */
export default {
  // Chỉ định chính xác các đường dẫn chứa class Tailwind
  // Tailwind quét các file này để biết class nào đang được dùng
  // -> Tree-shake toàn bộ class không dùng -> file CSS cuối cùng rất nhỏ
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // Bắt buộc phải có dòng này để Tremor components không bị purge CSS
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
  ],

  // Bật darkMode theo class thay vì media query
  // Cho phép ta kiểm soát dark mode bằng cách thêm class "dark" vào <html>
  // thay vì phụ thuộc hoàn toàn vào setting hệ điều hành của user
  darkMode: "class",

  theme: {
    extend: {
      // =============================================
      // DESIGN TOKENS - Bảng màu "Quiet Wealth"
      // =============================================
      // Quy tắc đặt tên: Dùng tên ngữ nghĩa thay vì tên màu kỹ thuật
      // VD: `surface` thay vì `zinc-900` - dễ bảo trì khi đổi theme
      colors: {
        // --- Nền tảng (Surfaces) ---
        surface: {
          // Light mode: giấy kem sang trọng, không trắng tinh 100%
          DEFAULT: "#FAF9F7", // off-white ấm - nền trang chính
          subtle: "#F4F2EE", // nhạt hơn một chút - nền card, section
          card: "#FFFFFF", // trắng thuần - card nổi bật trên nền subtle
          // Dark mode counterparts (dùng với prefix dark:)
          dark: "#141414", // gần đen - nền dark mode
          "dark-card": "#1E1E1E", // card trong dark mode
          "dark-subtle": "#191919",
        },

        // --- Màu văn bản ---
        ink: {
          DEFAULT: "#1A1A1A", // đen sâu - tiêu đề chính
          secondary: "#6B6860", // xám ấm - text phụ, label
          muted: "#A8A49E", // rất nhạt - placeholder, disabled
          inverse: "#FAF9F7", // text trên nền tối
        },

        // --- Accent: Sage Gold (điểm nhấn duy nhất, dùng có chọn lọc) ---
        // Lấy cảm hứng từ ánh vàng nhạt trên porcelain cao cấp
        gold: {
          50: "#FDFBF3",
          100: "#FAF3D6",
          200: "#F3E4A0",
          300: "#E8CC6A",
          400: "#D4A843", // ← ACCENT CHÍNH - đủ nổi bật mà không rực rỡ
          500: "#B8892C",
          600: "#946D1E",
          700: "#6F5016",
          foreground: "#1A1A1A",
        },

        // --- Semantic Colors (Thu nhập / Chi tiêu) ---
        // Không dùng xanh lá/đỏ sặc sỡ - dùng tông muted tinh tế hơn
        income: {
          DEFAULT: "#3D6B5A", // emerald sâu, muted
          light: "#EBF2EF", // nền tag thu nhập (light mode)
          "dark-light": "#1A2E28",
        },
        expense: {
          DEFAULT: "#8B4A3A", // terra cotta muted
          light: "#F5EDEB",
          "dark-light": "#2E1E1A",
        },

        // --- Tremor compatibility (override tremor's default blue) ---
        // TỐI ƯU (Junior): Tremor dùng key "tremor-brand" để apply màu mặc định
        // Override ở đây để toàn bộ Tremor component theo màu Gold thay vì xanh dương
        tremor: {
          brand: {
            faint: "#FDFBF3",
            muted: "#F3E4A0",
            subtle: "#E8CC6A",
            DEFAULT: "#D4A843",
            emphasis: "#946D1E",
            inverted: "#FFFFFF",
          },
          background: {
            muted: "#F4F2EE",
            subtle: "#FAF9F7",
            DEFAULT: "#FFFFFF",
            emphasis: "#1A1A1A",
          },
          border: {
            DEFAULT: "#E8E4DD",
          },
          ring: {
            DEFAULT: "#E8E4DD",
          },
          content: {
            subtle: "#A8A49E",
            DEFAULT: "#6B6860",
            emphasis: "#1A1A1A",
            strong: "#111111",
            inverted: "#FFFFFF",
          },
        },
      },

      // =============================================
      // TYPOGRAPHY - Cặp đôi Font "Quiet Wealth"
      // =============================================
      fontFamily: {
        // Font Serif - dành cho con số lớn, tiêu đề cấp 1
        // Tạo cảm giác permanence, prestige - như báo tài chính Financial Times
        serif: ['"Playfair Display"', '"Georgia"', "serif"],

        // Font Sans-serif - dành cho mọi text thông thường, data, label
        // DM Sans: geometric nhưng có warmth, không lạnh như Inter
        sans: ['"DM Sans"', '"system-ui"', "sans-serif"],

        // Font Mono - dành cho số tài khoản, mã giao dịch
        mono: ['"DM Mono"', '"Fira Code"', "monospace"],
      },

      // =============================================
      // SPACING - Generous negative space
      // =============================================
      // TỐI ƯU (Junior): Extend spacing với các giá trị custom
      // cho layout "hơi thở rộng rãi" - tránh cảm giác chật chội
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        30: "7.5rem",
        34: "8.5rem",
        88: "22rem",
        100: "25rem",
        112: "28rem",
        128: "32rem",
      },

      // =============================================
      // TYPOGRAPHY SCALE - Size lớn cho số dư
      // =============================================
      fontSize: {
        // Size đặc biệt cho con số "hero" - tổng số dư
        hero: ["5.5rem", { lineHeight: "1", letterSpacing: "-0.03em" }],
        display: ["4rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        title: ["2.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        heading: ["1.75rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        // Size nhỏ cho label/metadata - sắc nét
        label: ["0.6875rem", { lineHeight: "1.4", letterSpacing: "0.08em" }],
        micro: ["0.625rem", { lineHeight: "1.4", letterSpacing: "0.1em" }],
      },

      // =============================================
      // BORDERS & SHADOWS - Tinh tế, không heavy
      // =============================================
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        // Shadow rất nhẹ - tạo chiều sâu mà không nặng nề
        lift: "0 2px 8px rgba(26,26,26,0.06), 0 0 0 1px rgba(26,26,26,0.04)",
        float: "0 8px 32px rgba(26,26,26,0.08), 0 0 0 1px rgba(26,26,26,0.04)",
        "glow-gold": "0 0 0 3px rgba(212,168,67,0.2)",
      },

      // =============================================
      // ANIMATIONS - Subtle, không gây xao nhãng
      // =============================================
      transitionTimingFunction: {
        // Easing tự nhiên cho các animation sang trọng
        luxury: "cubic-bezier(0.25, 0.1, 0.25, 1)",
        reveal: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "number-reveal": {
          "0%": { opacity: "0", transform: "translateY(8px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fade-in 0.4s ease forwards",
        "number-reveal":
          "number-reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [],
};
