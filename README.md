# 🚀 Vibe Monorepo - E-commerce & CMS Ecosystem

Chào mừng bạn đến với **Vibe Monorepo**, một hệ sinh thái thương mại điện tử hiện đại được xây dựng trên cấu trúc Monorepo mạnh mẽ sử dụng **Nx** và **pnpm**.

## 🏗️ Kiến trúc hệ thống

Hệ thống bao gồm các thành phần chính sau:

| Thành phần              | Công nghệ                      | Mô tả                                                        |
| :---------------------- | :----------------------------- | :----------------------------------------------------------- |
| **@vibe/admin-cms**     | React, Vite, Shadcn UI         | Trang quản trị (Dashboard) để quản lý toàn bộ hệ thống.      |
| **@vibe/tiktok-client** | Next.js (App Router), Tailwind | Giao diện người dùng cuối, tối ưu cho trải nghiệm mua sắm.   |
| **@vibe/backend**       | NestJS, MySQL                  | Hệ thống API tập trung, xử lý logic nghiệp vụ và dữ liệu.    |
| **@vibe/shared**        | TypeScript                     | Thư viện dùng chung (API Client, Types, Utils) giữa các app. |

---

## 🛠️ Hướng dẫn cài đặt

### 1. Yêu cầu hệ thống

- **Node.js**: Phiên bản 20.x trở lên.
- **pnpm**: Phiên bản 9.x trở lên.
- **Database**: MySQL (đã được cấu hình trong backend).

### 2. Cài đặt Dependencies

Từ thư mục gốc của dự án, chạy lệnh:

```bash
pnpm install
```

### 3. Cấu hình biến môi trường

Mỗi ứng dụng có file `.env` riêng. Bạn cần kiểm tra và cấu hình các file sau:

- `apps/admin-cms/.env`
- `apps/tiktok-client/.env`
- `apps/backend/.env`

### 4. Khởi chạy dự án (Development)

Chạy tất cả các ứng dụng cùng lúc:

```bash
pnpm run dev:all
```

Hoặc chạy riêng lẻ từng ứng dụng:

- **Admin**: `pnpm run serve:admin` (Mặc định: http://localhost:3000)
- **Backend**: `pnpm run serve:backend` (Mặc định: http://localhost:3333)
- **TikTok Client**: `pnpm run serve:tiktok` (Mặc định: http://localhost:3001)

---

## 📦 Lệnh Build & Duy trì

| Lệnh                 | Mô tả                                                |
| :------------------- | :--------------------------------------------------- |
| `pnpm run build:all` | Build toàn bộ các project ra thư mục `/dist` ở root. |
| `pnpm run format`    | Tự động căn chỉnh format code cho toàn bộ dự án.     |
| `pnpm run lint:all`  | Kiểm tra lỗi cú pháp và tiêu chuẩn code.             |
| `pnpm run migrate`   | Kiểm tra và cập nhật phiên bản Nx.                   |

---

## 🛡️ Quy chuẩn Monorepo

- **Build tập trung**: Tất cả bản build được đẩy ra thư mục gốc `/dist` để dễ dàng quản lý và deploy.
- **Resilient Build**: TikTok Client được cấu hình để build thành công ngay cả khi Backend chưa hoạt động (sử dụng cơ chế fallback data).
- **Shared SDK**: Mọi thay đổi trong API Backend sẽ được cập nhật tự động vào thư viện `@vibe/shared` thông qua lệnh `gen-api`.

---

## 📄 Tài liệu chi tiết

- [Hướng dẫn khởi chạy hệ thống (Dev & Docker/Harbor)](./docs/RUNNING.md)
- [Mô tả tính năng hệ thống](./docs/FEATURES.md)
- [Hướng dẫn API (Shared SDK)](./libs/shared/README.md)

---

_Phát triển bởi đội ngũ Vibe Team._
