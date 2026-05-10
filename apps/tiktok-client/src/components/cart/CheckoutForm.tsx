import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { useCreateOrder } from "@/hooks/useOrders";
import { useLocalOrders } from "@/hooks/useLocalOrders";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { toast } from "sonner";
import {
  Loader2,
  ChevronLeft,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Ticket,
  User,
  Phone,
  X,
  Zap,
  Truck,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { useShopSettings } from "@/hooks/useShopSettings";
import OrderSuccessPopup from "./OrderSuccessPopup";
import Cookies from "js-cookie";

const checkoutSchema = z.object({
  name: z.string().min(1, "Họ tên không được để trống"),
  phone: z.string().regex(/^(\+84|0)?[3|5|7|8|9][0-9]{8}$/, "Số điện thoại không hợp lệ"),
  address: z.string().min(1, "Địa chỉ không được để trống"),
  note: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalAmount: number;
}

const CheckoutForm = ({ open, onOpenChange, totalAmount }: CheckoutFormProps) => {
  const { clearCart, items, selectedItemIds, updateQuantity, removeItem, getSelectedSavings } =
    useCartStore();
  const { getSetting } = useShopSettings();
  const { addOrder } = useLocalOrders();
  const [isVisible, setIsVisible] = useState(false);
  const [isNotePopupOpen, setIsNotePopupOpen] = useState(false);

  // Success Popup State
  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<number | null>(null);

  const { mutate: createOrder, isPending: isLoading } = useCreateOrder();

  const savings = getSelectedSavings();
  const savingsPercentage =
    totalAmount + savings > 0 ? Math.round((savings / (totalAmount + savings)) * 100) : 0;

  // Handle open/close animation
  useEffect(() => {
    if (open) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = "unset";
      return () => clearTimeout(timer);
    }
  }, [open]);

  const selectedItems = items.filter((item) => selectedItemIds.includes(item.id));

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<{
    name: string;
    phone: string;
    address: string;
    note: string;
  }>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      note: "",
    },
  });

  const watchNote = watch("note");

  const onSubmit = (data: any) => {
    // Collect marketing variables directly from individual cookies
    const marketingFields = [
      "utmSource",
      "utmMedium",
      "utmCampaign",
      "utmTerm",
      "utmContent",
      "marketingPlatform",
      "marketingPlatformId",
    ];

    let marketingData: Record<string, string> = {};
    marketingFields.forEach((field) => {
      const val = Cookies.get(field);
      if (val) marketingData[field] = val;
    });

    const payload = {
      customerName: data.name,
      customerPhone: data.phone,
      shippingAddress: data.address,
      notes: data.note,
      paymentMethod: "COD" as const,
      ...marketingData,
      items: selectedItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
    };

    createOrder(payload, {
      onSuccess: (response: any) => {
        const createdOrder = response?.data || response;
        if (createdOrder) {
          addOrder(createdOrder);
          setSuccessOrderId(createdOrder.id);
        }

        clearCart();
        reset();
        setIsVisible(false); // Hide checkout form immediately

        // Open Success popup
        setTimeout(() => {
          setIsSuccessPopupOpen(true);
        }, 100);
      },
      onError: () => {
        toast.error("Vui lòng điền đủ họ tên, SDT và địa chỉ giao hàng!");
      },
    });
  };

  // If both open and isVisible are false, unmount unless success popup is open
  if (!isVisible && !open && !isSuccessPopupOpen) return null;

  return (
    <>
      {isVisible && (
        <div
          className={cn(
            "fixed inset-0 z-[200] bg-background text-foreground flex flex-col transition-transform duration-300 ease-in-out sm:max-w-md sm:mx-auto sm:border-x sm:border-border",
            open ? "translate-y-0" : "translate-y-full",
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-3 py-3 border-b border-border shrink-0 bg-background pt-safe-top">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="p-1.5 hover:bg-muted rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <h2 className="text-[17px] font-bold flex-1 text-center pr-10">Thông tin đơn hàng</h2>
          </div>

          {/* Scrollable Content */}
          <form
            id="checkout-form"
            onSubmit={handleSubmit(onSubmit)}
            className="flex-1 overflow-y-auto space-y-2 scrollbar-hide bg-background pb-10"
          >
            {/* Address Card as Form */}
            <div className="bg-card relative pb-[3px]">
              <div className="p-4 pt-5 pb-5">
                <h3 className="font-bold text-[15px] mb-4 text-foreground">Thông tin người mua</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-border focus-within:border-primary pb-1.5 transition-colors">
                    <User className="w-4 h-4 text-muted-foreground shrink-0" />
                    <input
                      {...register("name")}
                      placeholder="Họ tên người nhận"
                      className={cn(
                        "w-full bg-transparent outline-none font-bold text-[15px] placeholder:font-normal placeholder:text-muted-foreground text-foreground",
                        errors.name ? "text-destructive" : "",
                      )}
                    />
                  </div>
                  <div className="flex items-center gap-3 border-b border-border focus-within:border-primary pb-1.5 transition-colors">
                    <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                    <input
                      {...register("phone")}
                      type="tel"
                      placeholder="Số điện thoại liên hệ"
                      className={cn(
                        "w-full bg-transparent outline-none text-[15px] placeholder:text-muted-foreground text-foreground",
                        errors.phone ? "text-destructive" : "",
                      )}
                    />
                  </div>
                  <div className="flex items-start gap-3 border-b border-border focus-within:border-primary pb-1.5 transition-colors pt-1">
                    <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                    <textarea
                      {...register("address")}
                      placeholder="Nhập địa chỉ nhà riêng/công ty chi tiết (Tòa nhà, phường/xã, quận/huyện, tỉnh/thành phố)"
                      rows={2}
                      className={cn(
                        "w-full bg-transparent outline-none text-[14.5px] resize-none placeholder:text-muted-foreground text-foreground",
                        errors.address ? "text-destructive" : "",
                      )}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-primary text-[12px] pl-7">* {errors.name.message}</p>
                  )}
                  {errors.phone && (
                    <p className="text-primary text-[12px] pl-7">* {errors.phone.message}</p>
                  )}
                  {errors.address && (
                    <p className="text-primary text-[12px] pl-7">* {errors.address.message}</p>
                  )}
                </div>
              </div>
              {/* TikTok signature striped border */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[3px]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, #FE2C55, #FE2C55 15px, transparent 15px, transparent 20px, #42C2FF 20px, #42C2FF 35px, transparent 35px, transparent 40px)",
                }}
              ></div>
            </div>

            {/* Store & Products Section */}
            <div className="bg-card">
              {/* Store Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="font-bold text-[14px] text-foreground">
                  {getSetting("store_name", "")}
                </div>
                <button
                  type="button"
                  onClick={() => setIsNotePopupOpen(true)}
                  className="flex items-center gap-1 text-[13px] text-muted-foreground hover:text-muted-foreground transition-colors max-w-[50%]"
                >
                  <span
                    className={cn("truncate max-w-[120px]", watchNote ? "text-foreground" : "")}
                  >
                    {watchNote || "Thêm ghi chú"}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              </div>

              {/* Products List */}
              {selectedItems.map((item) => {
                const hasDiscount = item.salePrice != null && item.salePrice < item.price;
                const discountPercent = hasDiscount
                  ? Math.round((1 - item.salePrice! / item.price!) * 100)
                  : 0;

                return (
                  <div key={item.id} className="p-4">
                    <div className="flex gap-3">
                      <div className="w-[96px] self-stretch min-h-[96px] bg-muted rounded relative shrink-0 border border-border/50 overflow-hidden">
                        <img
                          loading="lazy"
                          decoding="async"
                          src={getImageUrl(item.images?.[0]?.url) || "https://placehold.co/80"}
                          alt={item.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-[13px] font-medium line-clamp-2 text-foreground leading-snug">
                          {item.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          <div className="inline-flex items-center gap-0.5 text-[10px] border border-primary/30 text-primary px-1.5 py-0.5 rounded bg-primary/5 font-medium">
                            🔥 Đang bán chạy
                          </div>
                          {hasDiscount && discountPercent > 0 && (
                            <div className="inline-flex items-center gap-0.5 text-[10px] bg-[#FFF5F5] text-[#D01B1B] px-1.5 py-0.5 rounded-[2px] font-medium border border-[#D01B1B]/10">
                              Giảm {discountPercent}%
                            </div>
                          )}
                          <div className="inline-flex items-center gap-1 text-[10px] bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 px-1.5 py-0.5 rounded font-medium">
                            <ShieldCheck className="w-3 h-3" />
                            Trả hàng miễn phí
                          </div>
                        </div>

                        <div className="flex items-end justify-between mt-2.5">
                          <div className="flex items-end gap-1.5 flex-wrap">
                            <div className="font-bold text-[15px] text-foreground leading-none">
                              {formatPrice(item.salePrice || item.price)}
                            </div>
                            {hasDiscount && (
                              <div className="text-[12px] text-muted-foreground line-through leading-none pb-[1px]">
                                {formatPrice(item.price)}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center rounded border border-border bg-muted">
                            <button
                              type="button"
                              onClick={() => {
                                if (item.quantity > 1) {
                                  updateQuantity(item.id, item.quantity - 1);
                                } else {
                                  removeItem(item.id);
                                  if (selectedItems.length <= 1) onOpenChange(false);
                                }
                              }}
                              className="w-6 h-6 flex flex-col items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            >
                              -
                            </button>
                            <div className="w-6 h-6 flex items-center justify-center text-xs font-medium text-foreground border-x border-border bg-secondary">
                              {item.quantity}
                            </div>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 flex flex-col items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* TikTok Shipping Block */}
              <div className="mx-4 mb-4 mt-2 space-y-2.5">
                <h3 className="text-[14px] font-bold text-foreground">Phương thức vận chuyển</h3>
                <div className="bg-card border border-border p-3 rounded-lg flex items-start gap-3 cursor-pointer">
                  <div className="flex-1">
                    <div className="text-foreground font-medium text-[13px] flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-emerald-500" /> Tiêu chuẩn
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Dự kiến 3-5 ngày • Toàn quốc
                    </div>
                  </div>
                  <div className="flex flex-col items-end pt-1">
                    <span className="text-[13px] font-bold text-emerald-500">Miễn phí</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Order Discount Card */}
            {savings > 0 && (
              <div className="bg-card mb-2 border-b border-border">
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2 font-bold text-[14px] text-foreground">
                    <Ticket className="w-4 h-4 text-primary" /> Chiết khấu đơn hàng
                  </div>
                  <div className="text-[14px] font-bold text-primary">- {formatPrice(savings)}</div>
                </div>

                <div className="px-4 pb-4">
                  <div className="bg-[#FFF5F5] border border-[#D01B1B]/10 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <div className="text-[13px] font-bold text-[#D01B1B]">Đã áp dụng ưu đãi</div>
                      <div className="text-[11px] text-[#D01B1B]/80 mt-0.5">
                        Tiết kiệm trực tiếp trên tổng đơn
                      </div>
                    </div>
                    <div className="text-[12px] font-bold text-white bg-[#D01B1B] px-2 py-1 rounded shadow-sm">
                      Giảm {savingsPercentage}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TikTok Vouchers Block (Mocked visually) */}
            <div className="bg-card">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2 font-bold text-[14px] text-primary">
                  <Ticket className="w-4 h-4" /> Khuyến mãi VIP
                </div>
                <div className="flex items-center gap-0.5 text-[12px] text-cyan-400 font-medium">
                  Freeship <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="p-4">
                <div className="bg-gradient-to-r from-[#F0E4D2]/20 to-[#A67C52]/20 border border-[#A67C52]/20 dark:border-[#F0E4D2]/20 rounded-lg p-3 relative overflow-hidden">
                  <div className="absolute top-0 right-4 bg-gradient-to-r from-[#C89B6C] to-[#A67C52] text-white text-[9px] px-2 py-0.5 rounded-b font-medium">
                    Hoàn phí sau 1 đơn hàng
                  </div>
                  <div className="flex items-end justify-between mt-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#8c6239] dark:text-[#F0E4D2] text-[13px]">
                      <span className="bg-card text-[9px] px-1 py-0.5 border border-[#8c6239]/40 dark:border-[#F0E4D2]/40 rounded leading-none text-[#8c6239] dark:text-[#F0E4D2]">
                        VIP
                      </span>
                      Ưu đãi khách VIP
                    </div>
                    <div className="flex items-end gap-1.5 mt-1">
                      <span className="text-[12px] font-semibold text-[#8c6239]/80 dark:text-[#F0E4D2]/80 pb-[1.5px] uppercase tracking-wide">
                        Tối đa
                      </span>
                      <span className="font-extrabold text-[#8c6239] dark:text-[#F0E4D2] text-[20px] leading-none tracking-tight">
                        20.000đ
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] text-[#8c6239]/80 dark:text-[#F0E4D2]/70 mt-3 pt-3 border-t border-[#8c6239]/20 dark:border-[#F0E4D2]/10">
                    Ưu đãi lên đến <span className="text-primary font-medium">20%</span> &{" "}
                    <span className="text-primary font-medium">Miễn phí vận chuyển toàn quốc</span>
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Modern Sticky Footer matching TikTok Layout */}
          <div className="shrink-0 bg-background flex flex-col pt-3 pb-safe-bottom shadow-2xl z-10 border-t border-border">
            <div className="flex items-center justify-between px-4 mb-3">
              <span className="text-[14px] font-bold text-foreground">
                Tổng ({selectedItems.length} mặt hàng)
              </span>
              <div className="text-right">
                <div className="text-primary font-bold text-lg leading-none">
                  {formatPrice(totalAmount)}
                </div>
                {savings > 0 && (
                  <div className="text-primary text-[11px] mt-1 font-medium">
                    Tiết kiệm {formatPrice(savings)}
                  </div>
                )}
              </div>
            </div>

            <div className="px-4 pb-4">
              <button
                type="submit"
                form="checkout-form"
                disabled={isLoading}
                className="w-full h-[48px] bg-primary text-primary-foreground rounded-xl font-bold text-[16px] shadow-[0_4px_14px_rgba(254,44,85,0.4)] active:scale-[0.98] transition-all flex flex-col items-center justify-center disabled:opacity-70 disabled:scale-100"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2 text-primary-foreground">
                    <Loader2 className="w-5 h-5 animate-spin" /> Đang xử lý...
                  </div>
                ) : (
                  <div className="flex-1 h-12 bg-primary text-primary-foreground rounded-lg flex flex-col items-center justify-center shadow-lg animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite]">
                    <span>Đặt hàng</span>
                    <span className="text-[10px] font-semibold opacity-95">
                      Đang bán chạy | Freeship toàn quốc
                    </span>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Note Popup Overlay */}
          {isNotePopupOpen && (
            <div className="absolute inset-0 z-[210] bg-background flex flex-col sm:border-x sm:border-border animate-in slide-in-from-bottom-full duration-200">
              <div className="flex items-center gap-3 px-3 py-3 border-b border-border bg-background pt-safe-top">
                <button
                  type="button"
                  onClick={() => setIsNotePopupOpen(false)}
                  className="p-1.5 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-foreground" />
                </button>
                <h2 className="text-[17px] font-bold flex-1 text-center pr-10">Thêm ghi chú</h2>
              </div>
              <div className="p-4 flex-1">
                <textarea
                  {...register("note")}
                  placeholder="Ghi chú cho đơn hàng (Ví dụ: Giao giờ hành chính, gọi trước khi giao...)"
                  rows={6}
                  className="w-full bg-card text-foreground p-3 rounded-xl border border-border focus:border-primary outline-none text-[15px] resize-none placeholder:text-muted-foreground"
                  autoFocus
                />
              </div>
              <div className="p-4 pb-safe-bottom bg-background border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsNotePopupOpen(false)}
                  className="w-full h-[48px] bg-primary text-primary-foreground rounded-[10px] font-bold text-[15px] active:scale-[0.98] transition-all"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order Success Popup */}
      <OrderSuccessPopup
        open={isSuccessPopupOpen}
        onOpenChange={(val) => {
          setIsSuccessPopupOpen(val);
          if (!val) onOpenChange(false);
        }}
        orderId={successOrderId}
      />
    </>
  );
};

export default CheckoutForm;
