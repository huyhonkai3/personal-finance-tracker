import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Đặt alias `@` trỏ vào thư mục `src/`
// Thay vì import `../../components/Button`, ta viết `@/components/Button`
// Sạch hơn, không bị lỗi khi di chuyển file vì đường dẫn tuyệt đối từ gốc src
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    // Proxy API calls sang backend để tránh CORS khi dev
    // Frontend gọi /api/... -> Vite tự forward sang localhost:5000
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
