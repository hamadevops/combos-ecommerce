import { formatPrice } from "@/lib/utils";

interface CartBottomBarProps {
  totalCount: number;
  totalPrice: number;
  selectedCount: number;
  isAllSelected: boolean;
  onToggleAll: (checked: boolean) => void;
  onCheckout: () => void;
  savings: number;
}

export default function CartBottomBar({
  totalCount,
  totalPrice,
  selectedCount,
  isAllSelected,
  onToggleAll,
  onCheckout,
  savings,
}: CartBottomBarProps) {
  return (
    <div
      className="fixed left-0 right-0 bg-[#121212]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.4)] max-w-md mx-auto z-40 transition-all duration-300"
      style={{ bottom: "calc(80px + env(safe-area-inset-bottom))" }}
    >
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        {/* Select All */}
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="checkbox"
            className="w-5 h-5 accent-[#FE2C55] rounded-full cursor-pointer"
            checked={isAllSelected}
            onChange={(e) => onToggleAll(e.target.checked)}
          />
          <span className="text-xs text-white/50 font-medium">Tất cả ({totalCount})</span>
        </div>

        <div className="flex items-center gap-3 flex-1 justify-end min-w-0">
          {/* Price Info */}
          <div className="flex flex-col items-end justify-center">
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-white/50">Tổng:</span>
              <span className="text-[15px] font-bold text-[#FE2C55]">
                {formatPrice(totalPrice)}
              </span>
            </div>
            {savings > 0 && (
              <span className="text-[10px] text-[#00E5FF] bg-[#00E5FF]/10 px-1.5 py-0.5 rounded font-medium">
                Tiết kiệm {formatPrice(savings)}
              </span>
            )}
          </div>

          {/* Buy Button */}
          <button
            onClick={onCheckout}
            className="bg-[#FE2C55] text-white h-10 px-6 rounded-lg font-bold text-sm shadow-lg shadow-red-500/20 active:scale-95 transition-all shrink-0"
          >
            Mua hàng ({selectedCount})
          </button>
        </div>
      </div>
    </div>
  );
}
