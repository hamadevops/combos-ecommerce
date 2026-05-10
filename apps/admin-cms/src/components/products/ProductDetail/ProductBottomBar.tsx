import { Store, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProductBottomBarProps {
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export default function ProductBottomBar({ onAddToCart, onBuyNow }: ProductBottomBarProps) {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-2 max-w-md mx-auto z-50">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate("/")}
          className="flex flex-col items-center gap-0.5 px-3 py-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Store className="w-5 h-5" />
          <span className="text-[10px]">Cửa hàng</span>
        </button>

        <button
          onClick={onAddToCart}
          className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
        >
          <ShoppingCart className="w-6 h-6" />
        </button>

        <button
          onClick={onBuyNow}
          className="flex-1 py-3 bg-[#FE2C55] text-white rounded-lg font-bold text-base shadow-lg animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite]"
        >
          Mua ngay
        </button>
      </div>
    </div>
  );
}
