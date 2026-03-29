// utils/seedCategories.js
/**
 * Seed data danh mục hệ thống mặc định.
 * Chạy một lần khi DB trống. Sau đó các user mới đều có sẵn danh mục.
 *
 * Gọi hàm này trong config/db.js sau khi kết nối DB thành công.
 */

const Category = require("../models/Category");

// Danh sách danh mục hệ thống (user: null = dùng chung cho mọi user)
const DEFAULT_CATEGORIES = [
  // ===== THU NHẬP =====
  { name: "Lương", type: "income", color: "#3D6B5A", icon: "salary" },
  { name: "Thưởng", type: "income", color: "#4CAF50", icon: "bonus" },
  { name: "Đầu tư", type: "income", color: "#8BC34A", icon: "investment" },
  { name: "Freelance", type: "income", color: "#009688", icon: "freelance" },
  { name: "Thu nhập khác", type: "income", color: "#607D8B", icon: "other" },

  // ===== CHI TIÊU =====
  { name: "Ăn uống", type: "expense", color: "#E64A19", icon: "food" },
  { name: "Di chuyển", type: "expense", color: "#F57C00", icon: "transport" },
  { name: "Nhà ở", type: "expense", color: "#8B4A3A", icon: "housing" },
  { name: "Mua sắm", type: "expense", color: "#7B1FA2", icon: "shopping" },
  { name: "Sức khỏe", type: "expense", color: "#D32F2F", icon: "health" },
  {
    name: "Giải trí",
    type: "expense",
    color: "#1976D2",
    icon: "entertainment",
  },
  { name: "Giáo dục", type: "expense", color: "#0288D1", icon: "education" },
  { name: "Hóa đơn", type: "expense", color: "#455A64", icon: "bill" },
  { name: "Chi tiêu khác", type: "expense", color: "#607D8B", icon: "other" },
];

const seedCategories = async () => {
  try {
    // Chỉ seed nếu chưa có danh mục hệ thống nào (user: null)
    // Dùng countDocuments() thay vì find() để không load data lên memory
    const count = await Category.countDocuments({ user: null });

    if (count > 0) {
      console.log(`Đã có ${count} danh mục hệ thống - bỏ qua seed`);
      return;
    }

    // insertMany(): chèn nhiều document cùng lúc - nhanh hơn nhiều lần create() trong vòng lặp
    // ordered: false -> nếu 1 document lỗi, các document còn lại vẫn được chèn
    await Category.insertMany(
      DEFAULT_CATEGORIES.map((cat) => ({ ...cat, user: null })),
      { ordered: false },
    );
    console.log(
      `Seed thành công ${DEFAULT_CATEGORIES.length} danh mục hệ thống`,
    );
  } catch (error) {
    // chỉ log warning, không throw - lỗi seed không nên làm crash server
    console.warn(
      "Seed categories thất bại (không ảnh hưởng server):",
      error.message,
    );
  }
};

module.exports = seedCategories;
