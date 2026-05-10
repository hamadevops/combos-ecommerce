import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types/product";

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  selectedItemIds: number[];
  addItem: (product: Product, quantity?: number) => void;
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
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.id === product.id);
          const newState = existingItem
            ? {
                items: state.items.map((item) =>
                  item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
                ),
              }
            : { items: [...state.items, { ...product, quantity }] };

          // Auto-select new item
          return {
            ...newState,
            selectedItemIds: [...new Set([...state.selectedItemIds, product.id])],
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
