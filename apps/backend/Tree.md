src/
├── common/                 # Các thành phần dùng chung (Shared Kernel)
│   ├── decorators/         # Custom Decorators (@CurrentUser, @Roles)
│   ├── filters/            # Global Exception Filters (Xử lý lỗi tập trung)
│   ├── guards/             # Authentication & Authorization Guards
│   ├── interceptors/       # Transform response data (Format JSON trả về)
│   ├── interfaces/         # TypeScript Interfaces dùng chung
│   ├── pipes/              # Validation Pipes custom
│   └── utils/              # Các hàm tiện ích (Helper functions)
│
├── config/                 # Cấu hình hệ thống
│   ├── database.config.ts  # Cấu hình MikroORM
│   ├── app.config.ts       # Cấu hình chung (Port, Prefix...)
│   └── redis.config.ts     # Cấu hình Redis
│
├── database/               # Các file liên quan đến DB
│   ├── migrations/         # File migration do MikroORM sinh ra
│   └── seeders/            # Dữ liệu mẫu (Fake data)
│
├── modules/                # Nơi chứa logic chính (Feature Modules) - QUAN TRỌNG NHẤT
│   ├── auth/               # Module xác thực (Login, Register, JWT)
│   │   ├── dto/            # Data Transfer Object (Validate Input)
│   │   ├── strategies/     # Passport Strategies (JwtStrategy, LocalStrategy)
│   │   ├── guards/         # Guards riêng cho Auth
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   │
│   ├── users/              # Module quản lý người dùng
│   │   ├── dto/
│   │   ├── entities/       # Database Entities (MikroORM)
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   │
│   ├── upload/             # Module Upload file (S3)
│   │   └── ...
│   │
│   └── mail/               # Module gửi mail (Redis Queue Consumer)
│       ├── processors/     # Nơi xử lý Job từ Redis Queue
│       └── ...
│
├── providers/              # Các Service kết nối bên thứ 3 (được bọc lại)
│   ├── s3/                 # AWS S3 Client wrapper
│   └── mail/               # SendGrid/Nodemailer wrapper
│
├── app.module.ts           # Root Module (Gom tất cả lại)
├── main.ts                 # Entry Point
└── mikro-orm.config.ts     # Config cho CLI (đặt ở root src hoặc ngoài root project)