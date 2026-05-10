"use client";

import { Search, ShoppingCart, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState, useEffect } from "react";
import Link from "next/link";
import SearchOverlay from "@/components/shop/SearchOverlay";
import SearchTrigger from "@/components/shop/SearchTrigger";

interface HeaderProps {
  showSearch?: boolean;
  title?: string;
  showBack?: boolean;
}

const Header = ({ showSearch = true, title, showBack = false }: HeaderProps) => {
  const router = useRouter();
  const { getTotalItems } = useCartStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="tiktok-header">
      <div className="flex items-center gap-3 px-4 py-3">
        {showBack && (
          <button
            aria-label="Quay lại"
            onClick={() => {
              if (window.history.length > 2) {
                router.back();
              } else {
                router.push("/");
              }
            }}
            className="w-8 h-8 flex items-center justify-center"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {title ? (
          <h1 className="flex-1 text-lg font-semibold text-center">{title}</h1>
        ) : showSearch ? (
          <SearchTrigger onClick={() => setIsSearchOpen(true)} />
        ) : (
          <div className="flex-1" />
        )}

        <div className="flex items-center gap-3">
          <ThemeToggle className="h-8 w-8" />
          <Link href="/cart" aria-label="Giỏ hàng" className="relative">
            <ShoppingCart className="w-6 h-6" />
            {mounted && getTotalItems() > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] text-white rounded-full flex items-center justify-center font-medium">
                {getTotalItems()}
              </span>
            )}
          </Link>
        </div>
      </div>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
};

export default Header;
