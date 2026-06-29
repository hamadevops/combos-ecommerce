"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import SearchOverlay from "@/components/tiktok/shop/SearchOverlay";
import SearchTrigger from "@/components/tiktok/shop/SearchTrigger";
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
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { useShopSettings } from "@/hooks/useShopSettings";
import { getImageUrl } from "@/lib/utils";
import { ThemeToggle } from "@/components/tiktok/ThemeToggle";

interface ShopHeaderProps {
  showBack?: boolean;
}

const ShopHeader = ({ showBack = false }: ShopHeaderProps) => {
  const router = useRouter();
  const { getTotalItems } = useCartStore();
  const { getSetting } = useShopSettings();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        {backgroundUrl ? (
          <Image
            src={backgroundUrl}
            alt="Shop Background"
            fill
            sizes="100vw"
            priority
            unoptimized
            className="object-cover"
          />
        ) : (
          <img
            loading="lazy"
            src="/placeholder.svg"
            alt="Shop Background"
            fetchPriority="high"
            className="w-full h-full object-cover"
          />
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

        {/* Top navigation */}
        <div className="absolute top-0 left-0 right-0 gap-3 flex items-center p-4 z-20">
          {showBack && (
            <button
              aria-label="Quay lại"
              onClick={() => router.back()}
              className="w-8 h-8 flex items-center justify-center flex-shrink-0"
            >
              <ChevronLeft className="w-6 h-6 text-white drop-shadow-md" />
            </button>
          )}

          <SearchTrigger onClick={() => setIsSearchOpen(true)} variant="glass" />

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              aria-label="Chia sẻ"
              onClick={handleShare}
              className="w-8 h-8 flex items-center justify-center"
            >
              <Share2 className="w-5 h-5 text-white drop-shadow-md" />
            </button>
            <Link href="/cart" aria-label="Giỏ hàng" className="relative group p-1 -mx-1">
              <div className="absolute inset-0 bg-white/50 dark:bg-black/50 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <ShoppingCart className="w-6 h-6 text-white drop-shadow-md relative z-10" />
              {mounted && getTotalItems() > 0 && (
                <span className="absolute top-0 right-0 bg-tiktok-cyan text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold border-2 border-[#121212] z-20 shadow-sm animate-in zoom-in">
                  {getTotalItems()}
                </span>
              )}
            </Link>
            <ThemeToggle className="text-white hover:text-white hover:bg-white/10 h-8 w-8 [&_svg]:drop-shadow-md" />
          </div>
        </div>

        {/* Shop Info Card */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="relative w-16 h-16 rounded-full border-2 border-white overflow-hidden bg-background">
                {logoUrl ? (
                  <Image src={logoUrl} alt={storeName} fill priority className="object-cover" />
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

      {/* TOP1 Tagline */}
      <div className="bg-gradient-to-r from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] px-4 py-2 flex items-center justify-center gap-2 border-b border-white/5">
        <span className="text-[10px] text-yellow-400/80">⭐</span>
        <span className="text-xs font-bold tracking-wider bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
          Nhà Phân Phối TOP1 Toàn Quốc
        </span>
        <span className="text-[10px] text-yellow-400/80">⭐</span>
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

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};

export default ShopHeader;
