import React, { useEffect, useState } from "react";
import { X, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface OrderSuccessPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number | null;
}

const OrderSuccessPopup = ({ open, onOpenChange, orderId }: OrderSuccessPopupProps) => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = "";
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open && !isVisible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[300] bg-white flex flex-col transition-transform duration-300 ease-in-out sm:max-w-md sm:mx-auto",
        open ? "translate-y-0" : "translate-y-full",
      )}
    >
      {/* Header */}
      <div className="flex items-center px-4 py-3 shrink-0 pt-safe-top">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="p-1.5 hover:bg-muted rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-safe-bottom scrollbar-hide flex flex-col items-center px-4 pt-4">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-[#00D084] flex items-center justify-center mb-6 shadow-sm">
          <Check className="w-8 h-8 text-white stroke-[3px]" />
        </div>

        {/* Text Area */}
        <h2 className="text-[20px] font-bold text-center text-foreground mb-3 leading-tight tracking-tight">
          Cảm ơn bạn đã đặt hàng!
        </h2>
        <p className="text-[14px] text-muted-foreground text-center mb-8 px-2 max-w-[280px]">
          Bạn sẽ nhận cập nhật trong phần thông báo ở hộp thư đến.
        </p>

        {/* Action Button */}
        <button
          onClick={() => {
            onOpenChange(false);
            if (orderId) {
              router.push(`/orders/${orderId}`);
            } else {
              router.push("/orders");
            }
          }}
          className="w-full h-[48px] bg-[#F1F1F2] hover:bg-[#E5E5E5] text-foreground font-bold text-[15px] rounded-lg transition-colors mb-6"
        >
          Xem đơn hàng
        </button>

        {/* Voucher Section Mockup */}
        <div className="w-full flex items-center gap-3 mb-3">
          <div className="h-px bg-border flex-1"></div>
          <span className="text-[13px] font-medium text-foreground">
            Bạn có <span className="text-[#FE2C55] font-bold">5</span> voucher độc quyền
          </span>
          <div className="h-px bg-border flex-1"></div>
        </div>

        <h3 className="text-[18px] font-bold text-center mb-4">
          Giảm tổng cộng <span className="text-[#FE2C55]">2.928.000đ</span>
        </h3>

        {/* Voucher Cards */}
        <div className="w-full bg-gradient-to-b from-[#FE2C55] to-[#FE2C55]/90 rounded-2xl p-4 overflow-hidden relative shadow-lg">
          <div className="space-y-3 relative z-10">
            {/* Voucher Item 1 */}
            <div className="bg-[#E6F8F3] rounded border border-white p-3 flex flex-col items-center justify-center text-center relative">
              {/* Fake cutouts */}
              <div className="absolute top-1/2 -left-2 w-4 h-4 rounded-full bg-[#FE2C55] -translate-y-1/2"></div>
              <div className="absolute top-1/2 -right-2 w-4 h-4 rounded-full bg-[#FE2C55] -translate-y-1/2"></div>

              <div className="text-[15px] font-bold text-[#00A67E]">
                Giảm 500000đ phí vận chuyển
              </div>
              <div className="text-[12px] text-muted-foreground mt-0.5">cho đơn trên 1đ ⓘ</div>
            </div>

            {/* Voucher Item 2 */}
            <div className="bg-white rounded border border-white p-3 flex flex-col items-center justify-center text-center relative">
              {/* Fake cutouts */}
              <div className="absolute top-1/2 -left-2 w-4 h-4 rounded-full bg-[#FE2C55] -translate-y-1/2"></div>
              <div className="absolute top-1/2 -right-2 w-4 h-4 rounded-full bg-[#FE2C55] -translate-y-1/2"></div>

              <div className="text-[15px] font-bold text-[#E21038]">Giảm 10K đ</div>
              <div className="text-[12px] text-muted-foreground mt-0.5">cho đơn trên 99K đ ⓘ</div>
            </div>

            {/* Voucher Item 3 */}
            <div className="bg-white/95 rounded border border-white p-3 flex flex-col items-center justify-center text-center relative opacity-50 h-[60px] overflow-hidden">
              <div className="text-[15px] font-bold text-[#E21038]">Giảm 8%</div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#FE2C55] via-[#FE2C55]/90 to-transparent z-20 flex flex-col items-center justify-end pb-4 px-4">
            <div className="text-white text-sm mb-3 font-medium">+3 voucher khác</div>
            <Link
              href="/san-pham"
              onClick={() => onOpenChange(false)}
              className="w-full bg-white text-[#FE2C55] font-bold h-10 rounded-full shadow-md active:scale-95 transition-transform flex items-center justify-center"
            >
              Nhận và mua sắm ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPopup;
