"use client";

import PageLayout from "@/components/tiktok/layout/PageLayout";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Clock,
  Printer,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { useOrders } from "@/hooks/useOrders";
import { useLocalOrders } from "@/hooks/useLocalOrders";

// Mock Data for orders locally since this is a placeholder page

const statusIcons = {
  pending: Clock,
  shipping: Truck,
  completed: CheckCircle,
};

const statusColors = {
  pending: "text-tiktok-orange",
  shipping: "text-tiktok-cyan",
  completed: "text-tiktok-green",
};

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: {
    label: "Chờ xử lý",
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
    icon: Clock,
  },
  processing: {
    label: "Đang xử lý",
    color: "text-blue-600 bg-blue-50 border-blue-200",
    icon: Package,
  },
  shipping: {
    label: "Đang giao",
    color: "text-purple-600 bg-purple-50 border-purple-200",
    icon: Truck,
  },
  shipped: {
    label: "Đang giao",
    color: "text-purple-600 bg-purple-50 border-purple-200",
    icon: Truck,
  },
  delivered: {
    label: "Đã giao",
    color: "text-green-600 bg-green-50 border-green-200",
    icon: CheckCircle,
  },
  completed: {
    label: "Hoàn thành",
    color: "text-green-600 bg-green-50 border-green-200",
    icon: CheckCircle,
  },
  cancelled: { label: "Đã hủy", color: "text-red-600 bg-red-50 border-red-200", icon: XCircle },
  confirmed: {
    label: "Đã xác nhận",
    color: "text-blue-600 bg-blue-50 border-blue-200",
    icon: CheckCircle,
  },
};

const Orders = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { data: ordersData, isLoading } = useOrders();
  const { orders: localOrders } = useLocalOrders();

  useEffect(() => {
    setMounted(true);
  }, []);

  const apiOrders = Array.isArray(ordersData) ? ordersData : ordersData?.items || [];

  // Merge API orders and local orders, preferring API orders if duplicates exist
  const apiOrderIds = new Set(apiOrders.map((o: any) => o.id));
  const uniqueLocalOrders = (mounted ? localOrders : []).filter((o) => !apiOrderIds.has(o.id));
  const orders = [...apiOrders, ...uniqueLocalOrders].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleOrderClick = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  return (
    <PageLayout headerProps={{ title: "Đơn hàng của tôi", showBack: true, showSearch: false }}>
      <div className="p-4 space-y-3">
        {/* Order Status Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm whitespace-nowrap">
            Tất cả
          </button>
          <button className="px-4 py-2 bg-secondary rounded-full text-sm whitespace-nowrap">
            Chờ xác nhận
          </button>
          <button className="px-4 py-2 bg-secondary rounded-full text-sm whitespace-nowrap">
            Đang giao
          </button>
          <button className="px-4 py-2 bg-secondary rounded-full text-sm whitespace-nowrap">
            Đã giao
          </button>
        </div>

        {/* Orders List */}
        {isLoading && !mounted ? (
          <div className="flex justify-center p-8">
            <Loader2 className="animate-spin w-8 h-8 text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Package className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Chưa có đơn hàng nào</p>
          </div>
        ) : (
          orders.map((order: any) => {
            if (!order) return null;
            // Map status
            const statusKey = order.status?.toLowerCase() || "pending";
            const config =
              statusConfig[statusKey as keyof typeof statusConfig] || statusConfig["pending"];
            const StatusIcon = config.icon;
            const statusColor = config.color;

            // Get first item for display gracefully
            const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
            const productName = firstItem
              ? firstItem.productName ||
                (firstItem.product && typeof firstItem.product === "object"
                  ? firstItem.product.name
                  : `Đơn hàng #${order.id || "N/A"}`)
              : `Đơn hàng #${order.id || "N/A"}`;

            const productImage = firstItem
              ? firstItem.thumbnail ||
                (firstItem.product && typeof firstItem.product === "object"
                  ? firstItem.product.thumbnail
                  : "")
              : "";

            const totalQuantity = order.items
              ? order.items.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0)
              : 0;

            // Safely parse date
            const renderDate = () => {
              if (!order.createdAt) return "";
              try {
                const date = new Date(order.createdAt);
                if (isNaN(date.getTime())) return "";
                return date.toLocaleDateString("vi-VN");
              } catch {
                return "";
              }
            };

            return (
              <div
                key={order.id}
                className="bg-card rounded-xl p-4 space-y-3 cursor-pointer active:opacity-90 transition-opacity flex flex-col"
                onClick={() => handleOrderClick(order.id)}
              >
                {/* Status */}
                <div
                  className={`flex items-center gap-2 ${statusColor} self-start px-2 py-1 rounded-md`}
                >
                  <StatusIcon className="w-4 h-4" />
                  <span className="text-sm font-medium capitalize">
                    {order.status || "Chờ xác nhận"}
                  </span>
                </div>

                {/* Product */}
                <div className="flex gap-3">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                    {productImage && (
                      <img
                        loading="lazy"
                        decoding="async"
                        src={getImageUrl(productImage)}
                        alt={productName}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm line-clamp-2">{productName}</h3>
                    <p className="text-muted-foreground text-sm">
                      {order.items && order.items.length > 1
                        ? `và ${order.items.length - 1} sản phẩm khác`
                        : `x${totalQuantity}`}
                    </p>
                    <p className="text-primary font-semibold mt-1">
                      {formatPrice(order.totalAmount || 0)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-sm text-muted-foreground">{renderDate()}</span>
                  <button className="flex items-center gap-1 text-sm text-primary font-medium">
                    Xem chi tiết
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </PageLayout>
  );
};

export default Orders;
