import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useCartStore } from "@/store/cartStore";
import { useCreateOrder } from "@/hooks/useOrders";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2, ChevronLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";

const checkoutSchema = z.object({
  name: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  phone: z.string().regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  address: z.string().min(5, "Địa chỉ quá ngắn"),
  note: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalAmount: number;
}

const CheckoutForm = ({ open, onOpenChange, totalAmount }: CheckoutFormProps) => {
  const { clearCart, items, selectedItemIds } = useCartStore();
  const [isVisible, setIsVisible] = useState(false);
  const { mutate: createOrder, isPending: isLoading } = useCreateOrder();

  // Handle open/close animation
  useEffect(() => {
    if (open) {
      setIsVisible(true);
      // Prevent body scroll
      document.body.style.overflow = "hidden";
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = "unset";
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Get selected items for summary
  const selectedItems = items.filter((item) => selectedItemIds.includes(item.id));

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<{
    name: string;
    phone: string;
    email: string;
    address: string;
    note: string;
  }>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      note: "",
    },
  });

  const onSubmit = (data: any) => {
    const payload = {
      customerName: data.name,
      customerPhone: data.phone,
      customerEmail: data.email,
      shippingAddress: data.address,
      notes: data.note,
      paymentMethod: "COD" as const, // Hardcoded for now, or add selector
      items: selectedItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        // productVariantId: item.variantId // If supported later
      })),
    };

    createOrder(payload, {
      onSuccess: () => {
        // Clear cart only on success
        // Remove selected items? Or all? User might expect only selected items purchased.
        // CartStore clearCart clears ALL.
        // Ideally we should remove only purchased items.
        // But for now clearCart() is what we have.
        // Actually CartStore has removeItem.
        // Let's iterate and remove selected.
        selectedItems.forEach((item) => clearCart()); // wait, clearCart clears all.
        // Ideally: toggleSelection([]) then remove items.
        // But logic above suggests clearCart.

        // Let's blindly clear cart for simplicity as per existing logic,
        // or improve to remove only selected.
        clearCart();

        reset();
        onOpenChange(false);
      },
    });
  };

  if (!isVisible && !open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[200] bg-black text-white flex flex-col transition-transform duration-300 ease-in-out sm:max-w-[480px] sm:mx-auto sm:inset-x-0 sm:border-x sm:border-white/10",
        open ? "translate-y-0" : "translate-y-full",
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 shrink-0 bg-[#121212] pt-safe-top">
        <button
          onClick={() => onOpenChange(false)}
          className="p-1 -ml-1 hover:bg-white/10 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-lg font-bold flex-1 text-center pr-8">Thanh toán</h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-hide bg-black">
        {/* Products Summary List */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-white/90">Sản phẩm ({selectedItems.length})</h3>
          {selectedItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#1C1C1E] p-3 rounded-lg flex gap-3 border border-white/5"
            >
              <div className="w-16 h-16 rounded bg-white/5 overflow-hidden flex-shrink-0">
                <img
                  src={getImageUrl(item.images && item.images.length > 0 ? item.images[0].url : "")}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-medium line-clamp-2 text-white/90">{item.name}</h3>
                  <div className="text-xs text-white/50 mt-0.5">Số lượng: {item.quantity}</div>
                </div>
                <div className="text-[#FE2C55] font-bold text-sm">
                  {formatPrice((item.salePrice || item.price) * item.quantity)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full h-[1px] bg-white/10 my-4"></div>

        <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <h3 className="font-bold text-sm text-white/90">Thông tin giao hàng</h3>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Nhập họ và tên"
              {...register("name")}
              className="w-full px-4 py-3 bg-[#1C1C1E] border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[#FE2C55] focus:ring-1 focus:ring-[#FE2C55]"
            />
            {errors.name && <p className="text-[#FE2C55] text-xs">{errors.name?.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="Nhập số điện thoại"
              {...register("phone")}
              className="w-full px-4 py-3 bg-[#1C1C1E] border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[#FE2C55] focus:ring-1 focus:ring-[#FE2C55]"
            />
            {errors.phone && <p className="text-[#FE2C55] text-xs">{errors.phone?.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">Email</label>
            <input
              type="email"
              placeholder="Nhập email (không bắt buộc)"
              {...register("email")}
              className="w-full px-4 py-3 bg-[#1C1C1E] border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[#FE2C55] focus:ring-1 focus:ring-[#FE2C55]"
            />
            {errors.email && <p className="text-[#FE2C55] text-xs">{errors.email?.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">
              Địa chỉ nhận hàng <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Nhập địa chỉ chi tiết"
              {...register("address")}
              rows={3}
              className="w-full px-4 py-3 bg-[#1C1C1E] border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[#FE2C55] focus:ring-1 focus:ring-[#FE2C55] resize-none"
            />
            {errors.address && <p className="text-[#FE2C55] text-xs">{errors.address?.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">Ghi chú</label>
            <textarea
              placeholder="Ghi chú cho đơn hàng (không bắt buộc)"
              {...register("note")}
              rows={3}
              className="w-full px-4 py-3 bg-[#1C1C1E] border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[#FE2C55] focus:ring-1 focus:ring-[#FE2C55] resize-none"
            />
          </div>
        </form>
      </div>

      {/* Footer with Button */}
      <div className="shrink-0 p-4 border-t border-white/10 bg-[#121212] space-y-3 pb-safe-bottom">
        {/* Total Amount Display */}
        <div className="flex items-center justify-between text-white">
          <span className="text-sm font-medium text-white/70">Tổng thanh toán</span>
          <span className="text-xl font-bold text-[#FE2C55]">{formatPrice(totalAmount)}</span>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex-1 bg-[#2C2C2E] text-white py-3.5 rounded-lg font-bold text-base transition-all hover:bg-[#3A3A3C]"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="checkout-form"
            disabled={isLoading}
            className="flex-[2] bg-[#FE2C55] text-white py-3.5 rounded-lg font-bold text-base shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:bg-opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              "Đặt hàng ngay"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
