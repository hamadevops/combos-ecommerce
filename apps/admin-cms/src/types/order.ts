import { CreateOrderDto as GeneratedCreateOrderDto } from "@vibe/shared";

export type CreateOrderDto = GeneratedCreateOrderDto;

// Extend if necessary, or alias
// Generated types are 'unknown', so we define our own or use any
export type OrderResponse = any;
export type OrderListResponse = any;

export interface Order {
  id: number;
  code: string;
  totalAmount: number; // Mapped from finalAmount usually, or we add finalAmount
  finalAmount?: number;
  discountAmount?: number;
  status: string;
  paymentStatus: string;
  items: OrderItem[];
  createdAt: string;

  // Customer info
  customer?: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
  };
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  shippingAddress?: string;
}

export interface OrderItem {
  id: number;
  orderId?: number; // 'order' in JSON is number 1
  productId?: number; // 'product' in JSON is number 18
  product: number | any; // API returns number (ID) based on log
  productName: string;
  productVariant?: any;
  price: number;
  quantity: number;
  sku?: string;
  thumbnail?: string;
  total?: number;
  variantName?: string;
  variantOptions?: any;
}

// Order status/type might be useful if not generated
export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  SHIPPING = "shipping",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}
