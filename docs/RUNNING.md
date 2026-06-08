# 🚀 Hướng Dẫn Khởi Chạy Hệ Thống (Vibe Monorepo)

Tài liệu này hướng dẫn cách cài đặt và chạy toàn bộ hệ sinh thái **Vibe Monorepo** theo hai phương thức: **Chạy trực tiếp (Development)** và **Chạy qua Docker & Harbor (Containerized)**.

---

## 1. Phương thức 1: Chạy trực tiếp (Development Mode)

Chế độ này phù hợp khi bạn đang trong quá trình phát triển mã nguồn trực tiếp trên máy local.

### Yêu cầu hệ thống:
* **Node.js**: Phiên bản 20.x trở lên.
* **pnpm**: Phiên bản 9.x trở lên.

### Các bước thực hiện:
1. **Cài đặt dependencies**:
   ```bash
   pnpm install
   ```
2. **Cấu hình môi trường**:
   Thiết lập các file `.env` ở các thư mục tương ứng:
   * `apps/admin-cms/.env`
   * `apps/storefront/.env`
   * `apps/backend/.env`
3. **Khởi chạy hệ thống**:
   * Chạy tất cả các ứng dụng cùng lúc (Parallel):
     ```bash
     pnpm run dev:all
     ```
   * Hoặc khởi chạy riêng lẻ từng dịch vụ:
     * **Backend**: `pnpm run serve:backend` (Mặc định: http://localhost:3333)
     * **Admin CMS**: `pnpm run serve:admin` (Mặc định: http://localhost:3100)
     * **Storefront**: `pnpm run serve:tiktok` (Mặc định: http://localhost:3000)

---

## 2. Phương thức 2: Chạy qua Docker & Harbor (Containerized Mode)

Chế độ này đóng gói hệ thống dưới dạng các container Docker và sử dụng Harbor làm Registry quản lý hình ảnh (Docker Image).

### Bước 1: Khởi chạy Harbor Registry
Dịch vụ Harbor lưu trữ các Docker Image của dự án (Backend, Storefront, Admin CMS) và chạy độc lập.

Khởi động Harbor bằng lệnh:
```bash
docker compose -f docker-compose.harbor.yml up -d
```
* **Giao diện quản trị Harbor**: [http://localhost:8888](http://localhost:8888)
* **Tài khoản mặc định**:
  * **Username**: `admin`
  * **Password**: `Harbor12345`

### Bước 2: Build & Push Docker Image lên Harbor
Khi bạn có thay đổi về mã nguồn hoặc Dockerfile của ứng dụng, hãy chạy kịch bản tự động build và đẩy Docker Image mới lên registry local:
```bash
bash scripts/build-and-push.sh
```

### Bước 3: Khởi chạy các dịch vụ lưu trữ (Data Stack)
Nếu bạn **chưa có sẵn** các dịch vụ MySQL, Redis, MinIO... trên máy của mình, hãy chạy file data để khởi động chúng:
```bash
docker compose -f docker-compose.data.yml up -d
```
*(Nếu bạn đã có sẵn MySQL, Redis, MinIO cài đặt độc lập trên máy chủ của mình, bạn có thể bỏ qua bước này và chỉ cần cấu hình đúng các tham số kết nối trong tệp `.env`).*

### Bước 4: Khởi chạy các ứng dụng chính (App Stack)
Sau khi phần dữ liệu đã sẵn sàng, kéo các image ứng dụng mới nhất và khởi chạy:
```bash
# Pull các image ứng dụng mới nhất từ Harbor
docker compose pull

# Khởi chạy các ứng dụng chính (Backend, Storefront, Admin CMS)
docker compose up -d
```

---

## 🗺️ Bản đồ Cổng dịch vụ (Port Mapping)

Khi chạy qua Docker Compose, các dịch vụ được ánh xạ ra cổng ở host như sau:

| Dịch vụ | Địa chỉ truy cập | Mô tả |
| :--- | :--- | :--- |
| **Storefront** | [http://localhost:3000](http://localhost:3000) | Giao diện mua sắm phía khách hàng (Next.js) |
| **Admin CMS** | [http://localhost:3100](http://localhost:3100) | Trang quản trị Dashboard (React + Vite) |
| **Backend API** | [http://localhost:3333](http://localhost:3333) | API Gateway & Nghiệp vụ (NestJS) |
| **Harbor Portal** | [http://localhost:8888](http://localhost:8888) | Giao diện quản lý Docker Registry (Harbor) |
| **phpMyAdmin** | [http://localhost:8080](http://localhost:8080) | Công cụ quản lý Database MySQL trực quan |
| **MinIO Console** | [http://localhost:9001](http://localhost:9001) | Giao diện quản trị Storage Object (MinIO) |
| **MinIO API** | [http://localhost:9000](http://localhost:9000) | Cổng API cho việc upload/đọc file ảnh/video |

---

## 🛠️ Một số lỗi thường gặp và cách xử lý (Troubleshooting)

### 1. Storefront bị lỗi "Connection Refused" hoặc không thể truy cập cổng 3000
* **Nguyên nhân**: File `.env` dùng chung chứa biến môi trường `PORT=3333` (dành cho Backend). Khi chạy Docker Compose, container `storefront` nạp file `.env` này và chạy Next.js trên cổng `3333` bên trong container. Do đó việc ánh xạ cổng `3000:3000` của Docker bị lỗi kết nối.
* **Giải quyết**: Đảm bảo trong `docker-compose.yml` dịch vụ `storefront` có khai báo ghi đè:
  ```yaml
  environment:
      - PORT=3000
  ```

### 2. Container chuyển sang trạng thái `unhealthy` do lỗi Healthcheck
* **Nguyên nhân**: Mặc định kiểm tra sức khỏe của Docker sử dụng `localhost` (`http://localhost:3000`). Tuy nhiên trong môi trường mạng của Docker container (thường là Alpine Linux), `localhost` tự động phân giải ưu tiên IPv6 (`::1`), trong khi các máy chủ web (như Nginx, Next.js) chỉ lắng nghe IPv4 (`0.0.0.0`), gây ra lỗi `Connection refused`.
* **Giải quyết**: Đã thay thế địa chỉ kiểm tra sức khỏe trong các `Dockerfile` và `docker-compose.yml` thành IPv4 tường minh `127.0.0.1`:
  * Đối với storefront: `http://127.0.0.1:3000`
  * Đối với admin-cms: `http://127.0.0.1/`
