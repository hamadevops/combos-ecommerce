import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CartEmpty() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-24 h-24 mb-4 opacity-30 text-6xl flex items-center justify-center bg-white/5 rounded-full">
        <ShoppingCart className="w-10 h-10 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground font-medium mb-1">Giỏ hàng của bạn đang trống</p>
      <p className="text-muted-foreground text-sm mb-6 text-center max-w-[200px]">
        Hãy thêm sản phẩm vào giỏ hàng ngay nhé!
      </p>
      <button
        onClick={() => navigate("/")}
        className="px-8 py-2.5 bg-primary text-white rounded-full text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
      >
        Tiếp tục mua sắm
      </button>
    </div>
  );
}
