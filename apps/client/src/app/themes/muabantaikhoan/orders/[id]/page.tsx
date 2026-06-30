"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useOrderDetailByCode } from "@/hooks/useOrders";
import { useLocalOrders } from "@/hooks/useLocalOrders";
import DeviceLayoutWrapper from "@/components/muabantaikhoan/layout/DeviceLayoutWrapper";
import { useShopSettings } from "@/hooks/useShopSettings";
import {
  Loader2,
  MapPin,
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  CreditCard,
  Phone,
} from "lucide-react";
import { Order } from "@/types/order";
import { formatPrice, getImageUrl } from "@/lib/utils";
import Link from "next/link";

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  pending: { label: "Chờ thanh toán", icon: Clock, color: "text-orange-600 bg-orange-50 border-orange-200" },
  processing: { label: "Đang xử lý", icon: Package, color: "text-blue-600 bg-blue-50 border-blue-200" },
  shipping: { label: "Đang giao hàng", icon: Truck, color: "text-purple-600 bg-purple-50 border-purple-200" },
  shipped: { label: "Đang giao hàng", icon: Truck, color: "text-purple-600 bg-purple-50 border-purple-200" },
  delivered: { label: "Đã giao hàng", icon: CheckCircle, color: "text-green-600 bg-green-50 border-green-200" },
  completed: { label: "Hoàn thành", icon: CheckCircle, color: "text-green-600 bg-green-50 border-green-200" },
  cancelled: { label: "Đã hủy", icon: XCircle, color: "text-red-600 bg-red-50 border-red-200" },
  confirmed: { label: "Đã xác nhận", icon: CheckCircle, color: "text-blue-600 bg-blue-50 border-blue-200" },
};

const OrderDetail = () => {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const { data: orderData, isLoading: isApiLoading, error: apiError } = useOrderDetailByCode(id);
  const { getOrder: getLocalOrder } = useLocalOrders();

  const [localFallback, setLocalFallback] = useState<Order | null>(null);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const { getSetting } = useShopSettings();

  useEffect(() => {
    if (apiError || (!isApiLoading && !orderData)) {
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
      <DeviceLayoutWrapper>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
      </DeviceLayoutWrapper>
    );
  }

  if (!order) {
    return (
      <DeviceLayoutWrapper>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
          <Package className="w-16 h-16 text-gray-300" />
          <p className="text-gray-500 font-medium">Không tìm thấy đơn hàng</p>
          <button
            onClick={() => router.push("/orders")}
            className="text-red-600 text-sm font-semibold hover:underline"
          >
            ← Quay lại danh sách
          </button>
        </div>
      </DeviceLayoutWrapper>
    );
  }

  const statusKey = order.status?.toLowerCase() || "pending";
  const config = statusConfig[statusKey] || statusConfig["pending"];
  const StatusIcon = config.icon;

  return (
    <DeviceLayoutWrapper>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Breadcrumbs */}
          <nav className="flex text-sm text-gray-500">
            <Link href="/" className="hover:text-purple-600 transition-colors">Trang chủ</Link>
            <span className="mx-2">/</span>
            <Link href="/orders" className="hover:text-purple-600 transition-colors">Đơn hàng của tôi</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Chi tiết đơn hàng #{order.id}</span>
          </nav>

          {/* Main Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Status Header Banner */}
            <div className={`${config.color} px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
              <div className="flex items-center gap-3">
                <StatusIcon className="w-6 h-6 flex-shrink-0" />
                <div>
                  <h2 className="font-bold text-base">Trạng thái: {config.label}</h2>
                  {order.createdAt && (
                    <p className="text-xs opacity-75 mt-0.5">Thời gian đặt hàng: {formatDate(order.createdAt)}</p>
                  )}
                </div>
              </div>
              <div className="text-sm font-semibold">
                Mã đơn hàng: #{order.id}
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Address & Payment */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-600" /> Địa chỉ nhận hàng
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-1.5 text-sm text-gray-700">
                    <p className="font-bold text-gray-900">{order.customerName || order.customer?.fullName || "N/A"}</p>
                    <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" /> {order.customerPhone || order.customer?.phone || ""}</p>
                    <p className="text-gray-500 mt-1">{order.shippingAddress || ""}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-red-600" /> Chi tiết thanh toán
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-2 text-sm text-gray-700">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tổng tiền hàng</span>
                      <span className="font-medium text-gray-900">{formatPrice(order.totalAmount || order.finalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phí vận chuyển</span>
                      <span className="text-green-600 font-medium">Miễn phí</span>
                    </div>
                    {order.discountAmount ? (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Giảm giá</span>
                        <span className="text-red-600 font-medium">-{formatPrice(order.discountAmount)}</span>
                      </div>
                    ) : null}
                    <div className="border-t border-gray-200 my-2 pt-2 flex justify-between font-bold text-base">
                      <span className="text-gray-900">Thành tiền</span>
                      <span className="text-red-600">{formatPrice(order.finalAmount || order.totalAmount)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between text-xs text-gray-500">
                      <span>Phương thức thanh toán</span>
                      <span className="font-medium">COD (Thanh toán khi nhận hàng)</span>
                    </div>
                  </div>
                </div>

                {/* Cancel Button */}
                {["pending", "confirmed"].includes(statusKey) && (
                  <button
                    className="w-full py-3 border border-red-200 hover:border-red-300 text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold transition-colors"
                    onClick={() => setShowCancelPopup(true)}
                  >
                    Yêu cầu hủy đơn hàng
                  </button>
                )}
              </div>

              {/* Right Column: Products List */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-red-600" /> Sản phẩm ({order.items?.length || 0})
                </h3>
                <div className="border border-gray-100 rounded-lg overflow-hidden divide-y divide-gray-100">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex gap-4 p-4 hover:bg-gray-50/50 transition-colors">
                      <div className="w-16 h-16 rounded overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 flex items-center justify-center">
                        {item.thumbnail ? (
                          <img
                            loading="lazy"
                            decoding="async"
                            src={getImageUrl(item.thumbnail)}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug">{item.productName}</h4>
                        {item.variantName && (
                          <p className="text-xs text-gray-500">{item.variantName}</p>
                        )}
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span className="text-red-600 font-bold">
                            {formatPrice(item.price)}
                          </span>
                          <span className="text-xs text-gray-400">x{item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Popup */}
      {showCancelPopup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCancelPopup(false)} />
          <div className="relative bg-white rounded-xl w-full max-w-sm mx-auto p-6 shadow-xl animate-in fade-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-1">Liên hệ hỗ trợ hủy đơn</h3>
              <p className="text-gray-500 text-sm mb-6 px-2 leading-relaxed">
                Để hủy đơn hàng nhanh nhất, vui lòng gọi điện trực tiếp cho bộ phận hỗ trợ khách hàng.
              </p>
              <a
                href={`tel:${getSetting("contact_phone", "0333.315.233")}`}
                className="w-full py-3 bg-red-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-700 active:scale-[0.98] transition-all shadow-md shadow-red-600/10"
              >
                <Phone className="w-4 h-4" />
                Gọi {getSetting("contact_phone", "0333.315.233")}
              </a>
              <button
                onClick={() => setShowCancelPopup(false)}
                className="mt-4 text-sm text-gray-500 hover:text-gray-800 font-medium"
              >
                Quay lại
              </button>
            </div>
          </div>
        </div>
      )}
    </DeviceLayoutWrapper>
  );
};

export default OrderDetail;
