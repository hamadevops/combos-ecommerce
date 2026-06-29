"use client";

import { useEffect, useState } from "react";
import { Store, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/utils/format";
import { useCartStore } from "@/store/cartStore";
import Link from "next/link";

interface ProductBottomBarProps {
  price?: number;
  onAddToCart: () => void;
  onBuyNow: () => void;
  isAffiliate?: boolean;
}

export default function ProductBottomBar({ price, onAddToCart, onBuyNow, isAffiliate }: ProductBottomBarProps) {
  const router = useRouter();
  const { getTotalItems } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-2 max-w-md mx-auto z-50">
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="flex flex-col items-center gap-0.5 px-3 py-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Store className="w-5 h-5" />
          <span className="text-[10px]">Cửa hàng</span>
        </Link>

        {!isAffiliate && (
          <button
            onClick={onAddToCart}
            className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors relative"
          >
            <ShoppingCart className="w-5 h-5" />
            {mounted && getTotalItems() > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] bg-[#FE2C55] text-[10px] text-white rounded-full flex items-center justify-center font-bold border-2 border-background">
                {getTotalItems()}
              </span>
            )}
          </button>
        )}

        <button
          onClick={onBuyNow}
          className="flex-1 h-12 bg-[#FE2C55] text-white rounded-lg flex flex-col items-center justify-center shadow-lg animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite]"
        >
          <span className="font-bold text-[15px] leading-tight">
            {isAffiliate ? "Mua ngay (Link liên kết)" : "Mua ngay"}
          </span>
          {price !== undefined && !isAffiliate && (
            <span className="text-[11px] font-medium opacity-90 leading-tight">
              {formatPrice(price)}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
