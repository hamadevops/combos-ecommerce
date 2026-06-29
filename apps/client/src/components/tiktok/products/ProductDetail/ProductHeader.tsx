"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Share2, ShoppingCart, MoreHorizontal } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";
import SearchTrigger from "@/components/tiktok/shop/SearchTrigger";
import SearchOverlay from "@/components/tiktok/shop/SearchOverlay";

export default function ProductHeader() {
  const router = useRouter();
  const { getTotalItems } = useCartStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
            router.back();
          } else {
            router.push("/");
          }
        }}
        className="w-8 h-8 flex items-center justify-center hover:bg-secondary rounded-full transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <SearchTrigger onClick={() => setIsSearchOpen(true)} />

      <button onClick={handleShare} className="w-8 h-8 flex items-center justify-center">
        <Share2 className="w-5 h-5" />
      </button>

      <button
        onClick={() => router.push("/cart")}
        className="relative w-8 h-8 flex items-center justify-center"
      >
        <ShoppingCart className="w-5 h-5" />
        {mounted && getTotalItems() > 0 && (
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

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
