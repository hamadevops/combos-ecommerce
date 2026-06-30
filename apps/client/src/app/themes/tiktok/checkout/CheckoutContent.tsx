"use client";

import React from "react";

export default function CheckoutContent() {
  // TikTok theme không có trang checkout rời (nó là modal trong cart)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800">
      <h1 className="text-2xl font-bold mb-4">TikTok theme không có trang Checkout riêng</h1>
      <a href="/cart" className="text-blue-500 hover:underline">Về giỏ hàng</a>
    </div>
  );
}
