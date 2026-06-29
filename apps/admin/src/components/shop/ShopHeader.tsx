import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Search,
  Share2,
  ShoppingCart,
  ChevronRight,
  Shield,
  Package,
  Truck,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { useShopSettings } from "@/hooks/useShopSettings";
import { getImageUrl } from "@/lib/utils";

interface ShopHeaderProps {
  showBack?: boolean;
}

const ShopHeader = ({ showBack = false }: ShopHeaderProps) => {
  const navigate = useNavigate();
  const { getTotalItems } = useCartStore();
  const { getSetting } = useShopSettings();

  const storeName = getSetting("store_name", "Cửa hàng");
  const storeLogo = getSetting("store_logo");
  const storeBackground = getSetting("store_background");
  const storeRating = getSetting("store_rating", "5.0");

  // Handle logo/background which might be File objects in real app but string in mock
  // In real app, we'd use getImageUrl helper more extensively if it were file paths
  const backgroundUrl = getImageUrl(storeBackground);
  const logoUrl = getImageUrl(storeLogo);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Đã sao chép liên kết cửa hàng");
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <div className="relative">
      {/* Banner Section */}
      <div className="relative h-[200px] bg-card overflow-hidden">
        <img
          src={backgroundUrl}
          alt="Shop Background"
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://placehold.co/800x400/333333/FFFFFF?text=Background";
          }}
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

        {/* Top navigation */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 flex items-center justify-center mr-2"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/products")}
              className="w-8 h-8 flex items-center justify-center"
            >
              <Search className="w-5 h-5 text-white" />
            </button>
            <button onClick={handleShare} className="w-8 h-8 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => navigate("/cart")}
              className="relative w-8 h-8 flex items-center justify-center"
            >
              <ShoppingCart className="w-5 h-5 text-white" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] text-white rounded-full flex items-center justify-center font-medium">
                  {getTotalItems()}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Shop Info Card */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-full border-2 border-white overflow-hidden bg-background">
                {logoUrl ? (
                  <img src={logoUrl} alt={storeName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {storeName.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Shop Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-white font-bold text-lg truncate">{storeName}</h1>
                <ChevronRight className="w-4 h-4 text-white/70 flex-shrink-0" />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-[#00B8D4] text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                  Mall
                </span>
                <div className="flex items-center gap-1 bg-[#4CAF50] text-white text-[10px] px-1.5 py-0.5 rounded">
                  <Star className="w-2.5 h-2.5 fill-white" />
                  <span className="font-medium">{storeRating}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shop Benefits */}
      <div className="bg-[#2D2D2D] px-4 py-2">
        <div className="flex items-center justify-between gap-4 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1.5 text-white/90 text-xs whitespace-nowrap">
            <Shield className="w-3.5 h-3.5 text-tiktok-cyan" />
            <span>Nhập khẩu chính ngạch</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/90 text-xs whitespace-nowrap">
            <Package className="w-3.5 h-3.5 text-tiktok-cyan" />
            <span>Hỗ trợ 24/7</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/90 text-xs whitespace-nowrap">
            <Truck className="w-3.5 h-3.5 text-tiktok-cyan" />
            <span>Giao hàng nhanh</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopHeader;
