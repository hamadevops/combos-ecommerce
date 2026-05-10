import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search, Share2, ShoppingCart, MoreHorizontal } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";

export default function ProductHeader() {
  const navigate = useNavigate();
  const { getTotalItems } = useCartStore();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      navigate(`/products?search=${e.currentTarget.value}`);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Đã sao chép liên kết sản phẩm");
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <div className="sticky top-0 z-[100] bg-background flex items-center gap-2 px-2 py-2 border-b border-border">
      <button
        onClick={() => {
          if (window.history.length > 2) {
            navigate(-1);
          } else {
            navigate("/");
          }
        }}
        className="w-8 h-8 flex items-center justify-center hover:bg-secondary rounded-full transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Tìm kiếm"
          onKeyDown={handleSearch}
          className="w-full bg-secondary rounded-full pl-9 pr-4 py-2 text-sm"
        />
      </div>

      <button onClick={handleShare} className="w-8 h-8 flex items-center justify-center">
        <Share2 className="w-5 h-5" />
      </button>

      <button
        onClick={() => navigate("/cart")}
        className="relative w-8 h-8 flex items-center justify-center"
      >
        <ShoppingCart className="w-5 h-5" />
        {getTotalItems() > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] text-white rounded-full flex items-center justify-center font-medium">
            {getTotalItems()}
          </span>
        )}
      </button>
      <button
        onClick={() => toast.info("Tính năng khác đang phát triển")}
        className="w-8 h-8 flex items-center justify-center"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>
    </div>
  );
}
