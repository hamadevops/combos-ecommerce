"use client";

import React from "react";
import CheckoutDetail from "@/components/muabantaikhoan/features/checkout/CheckoutDetail";
import DeviceLayoutWrapper from "@/components/muabantaikhoan/layout/DeviceLayoutWrapper";
import { useCartStore } from "@/store/cartStore";
import { getImageUrl } from "@/lib/utils";

export default function CheckoutContent() {
  const { items, selectedItemIds } = useCartStore();

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
