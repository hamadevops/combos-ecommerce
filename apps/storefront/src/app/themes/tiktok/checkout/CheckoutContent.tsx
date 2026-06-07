"use client";

import React from "react";
import CheckoutDetail from "@/components/muabantaikhoan/features/checkout/CheckoutDetail";
import DeviceLayoutWrapper from "@/components/muabantaikhoan/layout/DeviceLayoutWrapper";
import { useCartStore } from "@/store/cartStore";
import { getImageUrl } from "@/lib/utils";

export default function CheckoutContent() {
  const { items, selectedItemIds } = useCartStore();
  const theme = process.env.NEXT_PUBLIC_THEME || "tiktok";

  if (theme === "muabantaikhoan") {
    // Nếu có selected items thì chỉ hiển thị selected, ngược lại hiển thị tất cả
    const checkoutItems = selectedItemIds.length > 0 
      ? items.filter(item => selectedItemIds.includes(item.id))
      : items;

    const mappedItems = checkoutItems.map(item => ({
      id: String(item.id),
      name: item.name,
      price: item.salePrice || item.price,
      quantity: item.quantity,
      thumbnail: getImageUrl(item.images?.[0]?.url) || "https://placehold.co/600",
    }));

    return (
      <DeviceLayoutWrapper>
        <CheckoutDetail items={mappedItems} />
      </DeviceLayoutWrapper>
    );
  }

  // TikTok theme không có trang checkout rời (nó là modal trong cart)
  // Tuy nhiên, nếu user bị lọt vào URL này thì ta điều hướng hoặc hiển thị trống.
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800">
      <h1 className="text-2xl font-bold mb-4">TikTok theme không có trang Checkout riêng</h1>
      <a href="/cart" className="text-blue-500 hover:underline">Về giỏ hàng</a>
    </div>
  );
}
