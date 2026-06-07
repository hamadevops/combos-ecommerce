import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product, ProductVariant } from "@/types/product";

export interface CartItem extends Product {
  quantity: number;
  selectedVariant?: ProductVariant;
  parentProductId?: number;
}

interface CartState {
  items: CartItem[];
  selectedItemIds: number[];
  addItem: (product: Product, quantity?: number, selectedVariant?: ProductVariant) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  toggleItemSelection: (productId: number) => void;
  toggleAllSelection: (selected: boolean) => void;
  setSelection: (ids: number[]) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getSelectedPrice: () => number;
  getSelectedSavings: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      selectedItemIds: [],
      addItem: (product, quantity = 1, selectedVariant?: ProductVariant) => {
        set((state) => {
          const itemId = selectedVariant ? selectedVariant.id : product.id;
          const existingItem = state.items.find((item) => item.id === itemId);
          let newState;
          if (existingItem) {
            newState = {
              items: state.items.map((item) =>
                item.id === itemId ? { ...item, quantity: item.quantity + quantity } : item,
              ),
            };
          } else {
            const cartItem: CartItem = {
              ...product,
              id: itemId,
              parentProductId: product.id,
              selectedVariant,
              quantity,
            };
            if (selectedVariant) {
              cartItem.price = selectedVariant.price;
              cartItem.salePrice = selectedVariant.salePrice ?? undefined;
              if (selectedVariant.sku) cartItem.sku = selectedVariant.sku;
              if (selectedVariant.optionValues && selectedVariant.optionValues.length > 0) {
                cartItem.name = `${product.name} (${selectedVariant.optionValues.join(" / ")})`;
              }
              
              // Find if any selected option has an imageUrl and prepend it
              if ((product as any).tierVariations && selectedVariant.optionValues) {
                const optWithImg = (product as any).tierVariations
                  .flatMap((t: any) => t.options || [])
                  .find((opt: any) => 
                    opt.imageUrl && 
                    selectedVariant.optionValues?.includes(opt.value)
                  );
                if (optWithImg && optWithImg.imageUrl) {
                  cartItem.images = [
                    { url: optWithImg.imageUrl } as any,
                    ...(product.images || []),
                  ];
                }
              }
            }
            newState = { items: [...state.items, cartItem] };
          }

          // Auto-select new item
          return {
            ...newState,
            selectedItemIds: [...new Set([...state.selectedItemIds, itemId])],
          };
        });
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
          selectedItemIds: state.selectedItemIds.filter((id) => id !== productId),
        }));
      },
      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item,
          ),
        }));
      },
      toggleItemSelection: (productId) => {
        set((state) => {
          const isSelected = state.selectedItemIds.includes(productId);
          return {
            selectedItemIds: isSelected
              ? state.selectedItemIds.filter((id) => id !== productId)
              : [...state.selectedItemIds, productId],
          };
        });
      },
      toggleAllSelection: (selected) => {
        set((state) => ({
          selectedItemIds: selected ? state.items.map((item) => item.id) : [],
        }));
      },
      setSelection: (ids) => set({ selectedItemIds: ids }),
      clearCart: () => set({ items: [], selectedItemIds: [] }),
      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },
      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          const effectivePrice = item.salePrice ? item.salePrice : item.price;
          return total + effectivePrice * item.quantity;
        }, 0);
      },
      getSelectedPrice: () => {
        const { items, selectedItemIds } = get();
        return items
          .filter((item) => selectedItemIds.includes(item.id))
          .reduce((total, item) => {
            const effectivePrice = item.salePrice ? item.salePrice : item.price;
            return total + effectivePrice * item.quantity;
          }, 0);
      },
      getSelectedSavings: () => {
        const { items, selectedItemIds } = get();
        return items
          .filter((item) => selectedItemIds.includes(item.id))
          .reduce((total, item) => {
            // Only count savings if there's a salePrice lower than price
            if (item.salePrice && item.salePrice > 0 && item.salePrice < item.price) {
              return total + (item.price - item.salePrice) * item.quantity;
            }
            return total;
          }, 0);
      },
    }),
    {
      name: "cart-storage",
    },
  ),
);
