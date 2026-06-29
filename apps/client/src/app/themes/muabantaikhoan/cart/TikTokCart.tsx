"use client";

import { useCartStore } from "@/store/cartStore";
import { useShopSettings } from "@/hooks/useShopSettings";
import { toast } from "sonner";
import { useState } from "react";
import CheckoutForm from "@/components/tiktok/cart/CheckoutForm";
import BottomNav from "@/components/tiktok/layout/BottomNav";
import CartHeader from "@/components/tiktok/cart/CartHeader";
import CartEmpty from "@/components/tiktok/cart/CartEmpty";
import CartShopGroup from "@/components/tiktok/cart/CartShopGroup";
import CartBottomBar from "@/components/tiktok/cart/CartBottomBar";

const Cart = () => {
  const { getSetting } = useShopSettings();
  const storeName = getSetting("store_name", "Cửa hàng");

  const {
    items,
    removeItem,
    updateQuantity,
    selectedItemIds,
    toggleItemSelection,
    toggleAllSelection,
    getSelectedPrice,
    getSelectedSavings,
  } = useCartStore();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const isAllSelected = items.length > 0 && selectedItemIds.length === items.length;
  const selectedCount = selectedItemIds.length;

  const handleCheckout = () => {
    if (selectedCount === 0) {
      toast.error("Vui lòng chọn sản phẩm để thanh toán");
      return;
    }
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground max-w-md mx-auto relative pb-32">
      <CartHeader
        itemCount={items.length}
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
      />

      {/* Cart Items */}
      <div className="p-2 space-y-3">
        {items.length === 0 ? (
          <CartEmpty />
        ) : (
          <>
            {/* Currently all items are grouped under one simulated shop since backend doesn't support multi-vendor cart yet */}
            <CartShopGroup
              shopName={storeName}
              items={items}
              selectedItemIds={selectedItemIds}
              isEditMode={isEditMode}
              onToggleItem={toggleItemSelection}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
              onToggleShop={toggleAllSelection}
            />

            {/* Placeholder for "You might also like" */}
            <div className="mt-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="h-[1px] bg-white/10 w-12"></div>
                <span className="text-muted-foreground text-sm font-medium">
                  Có thể bạn cũng thích
                </span>
                <div className="h-[1px] bg-white/10 w-12"></div>
              </div>
            </div>
          </>
        )}
      </div>

      {items.length > 0 && (
        <CartBottomBar
          totalCount={items.length}
          totalPrice={getSelectedPrice()}
          selectedCount={selectedCount}
          isAllSelected={isAllSelected}
          onToggleAll={toggleAllSelection}
          onCheckout={handleCheckout}
          savings={getSelectedSavings()}
        />
      )}

      <CheckoutForm
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        totalAmount={getSelectedPrice()}
      />

      <BottomNav />
    </div>
  );
};

export default Cart;
