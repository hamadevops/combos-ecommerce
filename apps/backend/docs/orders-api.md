# 📦 Orders API — Tài liệu cho Frontend

Base URL: `{API_HOST}/api/v1/orders`

---

## 1. Lấy danh sách đơn hàng `GET /`

> 🔒 Yêu cầu: Bearer Token + Permission `order.read`

### Query params

| Param | Kiểu | Mô tả |
|---|---|---|
| `page` | number | Trang hiện tại (default: 1) |
| `limit` | number | Số đơn/trang (default: 10) |
| `search` | string | Tìm theo mã đơn, tên KH, SĐT |
| `status` | `OrderStatus` | Lọc theo trạng thái đơn |
| `paymentStatus` | `PaymentStatus` | Lọc theo trạng thái thanh toán |
| `customerId` | number | Lọc theo khách hàng |

### Response

```json
{
  "success": true,
  "data": [ /* OrderObject[] */ ],
  "meta": { "total": 100, "page": 1, "limit": 10, "totalPages": 10 }
}
```

---

## 2. Lấy chi tiết đơn hàng theo ID `GET /:id`

> 🔒 Yêu cầu: Bearer Token + Permission `order.read`

### Response: `OrderObject` (full — có populate items, customer đầy đủ)

---

## 3. Lấy đơn hàng theo mã `GET /code/:code`

> 🌐 **Public** — Không cần đăng nhập. Dùng cho trang **tracking đơn hàng** phía khách.

```
GET /api/v1/orders/code/ORD-20260403-ABC123
```

---

## 4. Tạo đơn hàng mới `POST /`

> 🌐 **Public** — Không cần đăng nhập. Dùng cho trang **Checkout**.

### Request Body

```json
{
  "customerName": "Nguyễn Văn A",
  "customerPhone": "0987654321",
  "customerEmail": "a@example.com",
  "shippingAddress": "123 Đường ABC",
  "shippingCity": "Hà Nội",
  "shippingDistrict": "Cầu Giấy",
  "shippingWard": "Dịch Vọng",
  "notes": "Giao giờ hành chính",
  "paymentMethod": "COD",
  "shippingFee": 30000,
  "discountAmount": 0,

  // ── Marketing Attribution (optional) ──
  "utmSource": "tiktok",
  "utmMedium": "video_ads",
  "utmCampaign": "sale_thang_4",
  "utmTerm": "ao_thun",
  "utmContent": "video_1",
  "marketingPlatform": "TikTok",
  "marketingPlatformId": "TTCLID_XXXXXXXX",

  "items": [
    { "productId": 116, "quantity": 2 },
    { "productId": 55, "productVariantId": 12, "quantity": 1 }
  ]
}
```

> **Lưu ý UTM:** Các tham số UTM và `marketingPlatformId` nên được đọc từ cookie (đặt khi user vào landing page từ quảng cáo) và gửi kèm khi checkout.

---

## 5. Cập nhật đơn hàng `PUT /:id`

> 🔒 Yêu cầu: Bearer Token + Permission `order.update`

Endpoint đa năng — dùng để cập nhật **trạng thái, thông tin khách hàng, địa chỉ giao hàng** trong cùng một request.
Tất cả field đều là **optional** — chỉ gửi field cần thay đổi.

### Request Body

```json
{
  // ── Trạng thái ──────────────────────────────
  "status": "CONFIRMED",
  "paymentStatus": "PAID",

  // ── Thông tin khách hàng (nếu cần sửa) ──────
  "customerName": "Trần Thị B",
  "customerPhone": "0912345678",
  "customerEmail": "b@example.com",

  // ── Địa chỉ giao hàng ───────────────────────
  "shippingAddress": "456 Đường XYZ",
  "shippingCity": "TP.HCM",
  "shippingDistrict": "Quận 1",
  "shippingWard": "Bến Nghé",

  // ── Ghi chú ─────────────────────────────────
  "notes": "Gọi trước khi giao"
}
```

### Enum `OrderStatus`

| Giá trị | Ý nghĩa |
|---|---|
| `PENDING` | Chờ xác nhận |
| `CONFIRMED` | Đã xác nhận |
| `PROCESSING` | Đang xử lý |
| `SHIPPING` | Đang giao hàng |
| `COMPLETED` | Hoàn thành |
| `CANCELLED` | Đã hủy ⚠️ (xem bên dưới) |

### ⚠️ Hủy đơn hàng

Để hủy đơn, chỉ cần gửi `status: "CANCELLED"` vào endpoint này:

```json
// PUT /api/v1/orders/42
{ "status": "CANCELLED" }
```

**Các trường hợp bị từ chối (HTTP 400):**
- Đơn đã ở trạng thái `COMPLETED`
- Đơn đang ở trạng thái `SHIPPING`

---

## 6. Xóa đơn hàng `DELETE /:id`

> 🔒 Yêu cầu: Bearer Token + Permission `order.delete`

```
DELETE /api/v1/orders/42
```

---

## Cấu trúc `OrderObject`

```typescript
interface OrderObject {
  id: number;
  code: string;                    // "ORD-20260403-ABC123"

  // Thông tin khách
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;

  // Địa chỉ
  shippingAddress?: string;
  shippingCity?: string;
  shippingDistrict?: string;
  shippingWard?: string;
  notes?: string;

  // Tiền
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  finalAmount: number;

  // Trạng thái
  paymentMethod: 'COD' | 'BANK_TRANSFER';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';

  // Marketing Attribution
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  marketingPlatform?: string;
  marketingPlatformId?: string;

  // Quan hệ
  customer?: CustomerObject;
  items: OrderItemObject[];

  createdAt: string;   // ISO 8601
  updatedAt: string;
}

interface OrderItemObject {
  id: number;
  productName: string;
  variantName?: string;
  variantOptions?: { name: string; value: string }[];
  sku?: string;
  thumbnail?: string;
  quantity: number;
  price: number;
  total: number;
}
```

---

## Response lỗi phổ biến

| HTTP | Trường hợp |
|---|---|
| `400` | Dữ liệu không hợp lệ / hủy đơn không được phép |
| `401` | Chưa đăng nhập |
| `403` | Không có quyền truy cập |
| `404` | Không tìm thấy đơn hàng |
