"use client";

import DeviceLayoutWrapper from "@/components/muabantaikhoan/layout/DeviceLayoutWrapper";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Clock,
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
import Link from "next/link";

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
    <DeviceLayoutWrapper>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="flex text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-purple-600 transition-colors">Trang chủ</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Đơn hàng của tôi</span>
          </nav>

          <h1 className="text-2xl font-bold text-gray-900 mb-6">Đơn hàng của tôi</h1>

          {/* Orders List */}
          {isLoading && !mounted ? (
            <div className="flex justify-center p-12 bg-white rounded-xl border border-gray-100 shadow-sm">
              <Loader2 className="animate-spin w-8 h-8 text-red-600" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
              <Package className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500">Chưa có đơn hàng nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order: any) => {
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
                    className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
                    onClick={() => handleOrderClick(order.id)}
                  >
                    <div className="flex gap-4 flex-1">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 flex items-center justify-center">
                        {productImage ? (
                          <img
                            loading="lazy"
                            decoding="async"
                            src={getImageUrl(productImage)}
                            alt={productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-900 text-sm md:text-base">Mã đơn: #{order.id}</span>
                          <div
                            className={`flex items-center gap-1.5 ${statusColor} px-2 py-0.5 rounded text-xs font-semibold border`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            <span>{config.label}</span>
                          </div>
                        </div>
                        <h3 className="text-sm text-gray-700 line-clamp-1">{productName}</h3>
                        <p className="text-gray-500 text-xs">
                          {order.items && order.items.length > 1
                            ? `và ${order.items.length - 1} sản phẩm khác`
                            : `Số lượng: x${totalQuantity}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex md:flex-col justify-between items-center md:items-end gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Tổng thanh toán</p>
                        <p className="text-red-600 font-bold text-base md:text-lg">
                          {formatPrice(order.totalAmount || 0)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <span>{renderDate()}</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DeviceLayoutWrapper>
  );
};

export default Orders;
