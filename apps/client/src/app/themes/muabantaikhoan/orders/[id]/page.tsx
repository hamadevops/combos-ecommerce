"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useOrderDetailByCode } from "@/hooks/useOrders";
import { useLocalOrders } from "@/hooks/useLocalOrders";
import PageLayout from "@/components/tiktok/layout/PageLayout";
import { useShopSettings } from "@/hooks/useShopSettings";
import { Separator } from "@/components/tiktok/ui/separator";
import {
  Loader2,
  MapPin,
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  CreditCard,
  ChevronRight,
  Phone,
} from "lucide-react";
import { Order } from "@/types/order";
import { formatPrice, getImageUrl } from "@/lib/utils";

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  pending: { label: "Chờ thanh toán", icon: Clock, color: "text-orange-600 bg-orange-50" },
  processing: { label: "Đang xử lý", icon: Package, color: "text-blue-600 bg-blue-50" },
  shipping: { label: "Đang giao hàng", icon: Truck, color: "text-purple-600 bg-purple-50" },
  shipped: { label: "Đang giao hàng", icon: Truck, color: "text-purple-600 bg-purple-50" },
  delivered: { label: "Đã giao hàng", icon: CheckCircle, color: "text-green-600 bg-green-50" },
  completed: { label: "Hoàn thành", icon: CheckCircle, color: "text-green-600 bg-green-50" },
  cancelled: { label: "Đã hủy", icon: XCircle, color: "text-red-600 bg-red-50" },
  confirmed: { label: "Đã xác nhận", icon: CheckCircle, color: "text-blue-600 bg-blue-50" },
};

const OrderDetail = () => {
  const params = useParams();
  const id = params?.id as string; // can be orderCode (e.g. "ORD-001") or numeric id fallback
  const router = useRouter();

  const { data: orderData, isLoading: isApiLoading, error: apiError } = useOrderDetailByCode(id);
  const { getOrder: getLocalOrder } = useLocalOrders();

  const [localFallback, setLocalFallback] = useState<Order | null>(null);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const { getSetting } = useShopSettings();

  useEffect(() => {
    if (apiError || (!isApiLoading && !orderData)) {
      // Try local storage fallback using numeric id if available
      const numericId = Number(id);
      if (!isNaN(numericId)) {
        const fallback = getLocalOrder(numericId);
        if (fallback) setLocalFallback(fallback);
      }
    }
  }, [apiError, isApiLoading, orderData, id, getLocalOrder]);

  const apiOrder: Order = orderData?.data || orderData;
  const order = apiOrder || localFallback;
  const isActuallyLoading = isApiLoading && !localFallback;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  if (isActuallyLoading) {
    return (
      <PageLayout headerProps={{ title: "Chi tiết đơn hàng", showBack: true, showSearch: false }}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  if (!order) {
    return (
      <PageLayout headerProps={{ title: "Chi tiết đơn hàng", showBack: true, showSearch: false }}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
          <Package className="w-16 h-16 text-muted-foreground" />
          <p className="text-muted-foreground">Không tìm thấy đơn hàng</p>
          <button
            onClick={() => router.push("/orders")}
            className="text-primary text-sm font-medium"
          >
            ← Quay lại danh sách
          </button>
        </div>
      </PageLayout>
    );
  }

  const statusKey = order.status?.toLowerCase() || "pending";
  const config = statusConfig[statusKey] || statusConfig["pending"];
  const StatusIcon = config.icon;

  return (
    <PageLayout headerProps={{ title: `Đơn hàng #${order.id}`, showBack: true, showSearch: false }}>
      <div className="space-y-2 bg-secondary/30">
        {/* Status Banner */}
        <div className={`${config.color} px-4 py-3`}>
          <div className="flex items-center gap-3">
            <StatusIcon className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-[15px]">{config.label}</p>
              {order.createdAt && (
                <p className="text-xs opacity-75 mt-0.5">{formatDate(order.createdAt)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-card px-4 py-3">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Địa chỉ nhận hàng</p>
              <p className="text-sm font-medium">
                {order.customerName || order.customer?.fullName || "N/A"}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.customerPhone || order.customer?.phone || ""}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">{order.shippingAddress || ""}</p>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground mb-3">
            Sản phẩm ({order.items?.length || 0})
          </p>
          <div className="space-y-3">
            {order.items?.map((item, index) => (
              <div key={index} className="flex gap-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                  {item.thumbnail ? (
                    <img
                      loading="lazy"
                      decoding="async"
                      src={getImageUrl(item.thumbnail)}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm line-clamp-2">{item.productName}</h3>
                  {item.variantName && (
                    <p className="text-xs text-muted-foreground mt-0.5">{item.variantName}</p>
                  )}
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-primary font-medium text-sm">
                      {formatPrice(item.price)}
                    </span>
                    <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-card px-4 py-3">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4 text-primary" />
            <p className="text-xs text-muted-foreground">Chi tiết thanh toán</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tổng tiền hàng</span>
              <span>{formatPrice(order.totalAmount || order.finalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phí vận chuyển</span>
              <span className="text-green-600">Miễn phí</span>
            </div>
            {order.discountAmount ? (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Giảm giá</span>
                <span className="text-red-500">-{formatPrice(order.discountAmount)}</span>
              </div>
            ) : null}
            <Separator className="my-1" />
            <div className="flex justify-between font-bold">
              <span>Thành tiền</span>
              <span className="text-primary text-base">
                {formatPrice(order.finalAmount || order.totalAmount)}
              </span>
            </div>
          </div>
          <Separator className="my-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Phương thức thanh toán</span>
            <span>COD</span>
          </div>
        </div>

        {/* Cancel Action */}
        {["pending", "confirmed"].includes(statusKey) && (
          <div className="bg-card px-4 py-3">
            <button
              className="w-full py-2.5 border border-red-200 text-red-500 rounded-lg text-sm font-medium active:bg-red-50 transition-colors"
              onClick={() => setShowCancelPopup(true)}
            >
              Hủy đơn hàng
            </button>
          </div>
        )}
      </div>

      {/* Cancel Order Popup */}
      {showCancelPopup && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCancelPopup(false)} />
          <div className="relative bg-card rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm mx-auto p-5 pb-8 animate-in slide-in-from-bottom duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-3">
                <Phone className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="font-bold text-[16px] mb-1">Liên hệ để hủy đơn</h3>
              <p className="text-muted-foreground text-[13px] mb-4 px-2">
                Để hủy đơn hàng, vui lòng liên hệ trực tiếp với nhà cung cấp qua số điện thoại bên
                dưới.
              </p>
              <a
                href={`tel:${getSetting("contact_phone", "0333.315.233")}`}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg text-sm font-bold flex items-center justify-center gap-2 active:opacity-90 transition-opacity"
              >
                <Phone className="w-4 h-4" />
                Gọi {getSetting("contact_phone", "0333.315.233")}
              </a>
              <button
                onClick={() => setShowCancelPopup(false)}
                className="mt-3 text-sm text-muted-foreground"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default OrderDetail;
