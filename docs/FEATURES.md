# ✨ Mô tả tính năng hệ thống Vibe

Tài liệu này chi tiết hóa các tính năng hiện có trong hệ sinh thái Vibe Monorepo.

---

## 🔐 1. Hệ thống Backend (NestJS)

Đóng vai trò là "bộ não" trung tâm, cung cấp API bảo mật và hiệu suất cao.

- **Quản lý xác thực (Authentication):** Sử dụng JWT (JSON Web Token), hỗ trợ đăng nhập, đăng ký và phân quyền.
- **Quản lý tệp tin (Upload Service):** Hỗ trợ upload hình ảnh sản phẩm, avatar người dùng.
- **Quản lý cài đặt (Settings):** Lưu trữ cấu hình hệ thống, thông tin cửa hàng.
- **Hệ thống Webhook:** Hỗ trợ tích hợp các dịch vụ bên thứ ba (thanh toán, vận chuyển).
- **Shared SDK:** Tự động tạo mã nguồn client (TypeScript SDK) từ định nghĩa API, giúp đồng bộ hóa dữ liệu giữa frontend và backend 100%.

---

## 🖥️ 2. Trang Quản trị - Admin CMS (React + Vite)

Giao diện quản lý dành cho chủ cửa hàng và nhân viên.

- **Bảng điều khiển (Dashboard):** Thống kê doanh thu, đơn hàng và số lượng người dùng theo thời gian thực.
- **Quản lý Sản phẩm:**
  - Thêm/Sửa/Xóa sản phẩm với trình soạn thảo văn bản giàu tính năng (Rich Text).
  - Quản lý biến thể sản phẩm (Kích thước, Màu sắc).
  - Tối ưu hóa hình ảnh tự động khi upload.
- **Quản lý Danh mục:** Phân loại sản phẩm theo nhiều cấp độ.
- **Quản lý Đơn hàng:** Theo dõi trạng thái đơn hàng (Đang xử lý, Đang giao, Hoàn thành).
- **Quản lý Người dùng & Phân quyền:**
  - Quản lý danh sách khách hàng và nhân viên.
  - Phân quyền chi tiết (Roles & Permissions) cho từng nhân viên.
- **Cấu hình hệ thống:** Chỉnh sửa thông tin cửa hàng, cổng thanh toán, v.v.

---

## 📱 3. Giao diện Người dùng - TikTok Client (Next.js)

Trang mua sắm tối ưu cho thiết bị di động và trải nghiệm mượt mà.

- **Trang chủ động:** Hiển thị sản phẩm nổi bật, banner khuyến mãi.
- **Khám phá Sản phẩm:**
  - Tìm kiếm và lọc sản phẩm theo danh mục, giá cả.
  - Xem chi tiết sản phẩm với hình ảnh chất lượng cao.
- **Giỏ hàng (Shopping Cart):** Quản lý sản phẩm đã chọn, cập nhật số lượng nhanh chóng.
- **Thanh toán (Checkout):**
  - Quy trình đặt hàng tối giản.
  - Tích hợp nhiều phương thức thanh toán.
- **Tối ưu hóa hiệu năng (SEO & Performance):**
  - Server Side Rendering (SSR) giúp tải trang cực nhanh và tốt cho SEO.
  - Cơ chế "Resilient Fetch" đảm bảo trang web vẫn hiển thị kể cả khi Backend gặp sự cố tạm thời.

---

## 🛠️ Công nghệ sử dụng

- **Core:** TypeScript (toàn bộ dự án).
- **UI Frameworks:** Shadcn UI, Tailwind CSS.
- **State Management:** TanStack Query (React Query), Zustand.
- **Form Management:** React Hook Form, Zod.

---

_Tài liệu này sẽ được cập nhật liên tục khi có tính năng mới._
