"use client";

import React from "react";
import TikTokCart from "./TikTokCart";
import CartDetail from "@/components/muabantaikhoan/features/cart/CartDetail";
import DeviceLayoutWrapper from "@/components/muabantaikhoan/layout/DeviceLayoutWrapper";
import { useCartStore } from "@/store/cartStore";
import { getImageUrl } from "@/lib/utils";

export default function CartContent() {
  const { items, updateQuantity, removeItem } = useCartStore();
  const theme = process.env.NEXT_PUBLIC_THEME || "tiktok";

  if (theme === "muabantaikhoan") {
    // Map store items to CartDetail's expected format
    const mappedItems = items.map(item => ({
      id: String(item.id),
      name: item.name,
      price: item.salePrice || item.price,
      quantity: item.quantity,
      thumbnail: getImageUrl(item.images?.[0]?.url) || "https://placehold.co/600",
    }));

    return (
      <DeviceLayoutWrapper>
        <CartDetail 
          items={mappedItems} 
          onUpdateQuantity={(id, newQty) => updateQuantity(Number(id), newQty)}
          onRemove={(id) => removeItem(Number(id))}
        />
      </DeviceLayoutWrapper>
    );
  }

  // Mặc định fallback về TikTok theme
  return <TikTokCart />;
}
