backend/
├── config/
│   └── db.js               # Kết nối MongoDB
├── models/
│   ├── User.js             # Schema người dùng
│   ├── Category.js         # Schema danh mục
│   ├── Transaction.js      # Schema giao dịch
│   └── Budget.js           # Schema hạn mức ngân sách
├── .env                    # Biến môi trường (KHÔNG commit Git)
├── .gitignore
├── package.json
└── server.js               # Entry point
