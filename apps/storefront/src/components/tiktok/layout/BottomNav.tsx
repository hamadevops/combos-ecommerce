"use client";

import { useState, useEffect } from "react";
import { Home, Grid3X3, ShoppingCart, Store, Package } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";

const navItems = [
  { icon: Store, label: "Trang chủ", path: "/" },
  { icon: Package, label: "Sản phẩm", path: "/san-pham" },
  { icon: Grid3X3, label: "Danh mục", path: "/danh-muc" },
  { icon: ShoppingCart, label: "Giỏ hàng", path: "/cart" },
];

const BottomNav = () => {
  const pathname = usePathname();
  const { getTotalItems } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
      style={{ paddingRight: "0px", marginRight: "0px" }}
      data-scroll-locked-ignore
    >
      <div className="max-w-md mx-auto relative pointer-events-auto">
        {/* Main Bar Background with Gradient Border */}
        <nav className="relative pb-safe">
          {/* Glass Background */}
          <div className="absolute inset-0 bg-[#0A0A0A]/95 backdrop-blur-xl rounded-t-[24px] border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]"></div>

          {/* Top Gradient Line for "Pop" */}
          <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

          <div className="flex items-center justify-around px-2 h-[80px] relative z-10">
            {navItems.map((item) => {
              const isActive =
                pathname === item.path || (item.path === "/san-pham" && pathname === "/products");

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  aria-label={item.label}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 transition-all duration-300 w-16 h-full",
                    isActive ? "text-[#FE2C55]" : "text-white/40 hover:text-white/80",
                  )}
                >
                  <div className="relative group-hover:scale-110 transition-transform">
                    <item.icon
                      className={cn(
                        "w-6 h-6",
                        isActive && "drop-shadow-[0_0_8px_rgba(254,44,85,0.5)]",
                      )}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {item.label === "Giỏ hàng" && mounted && getTotalItems() > 0 && (
                      <span className="absolute -top-2 -right-2 bg-gradient-to-r from-[#FE2C55] to-[#FF0050] text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold border-2 border-[#0A0A0A] shadow-sm">
                        {getTotalItems()}
                      </span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium transition-all",
                      isActive ? "opacity-100" : "opacity-80",
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default BottomNav;
