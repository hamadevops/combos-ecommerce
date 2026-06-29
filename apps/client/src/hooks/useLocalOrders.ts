import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Order } from "@/types/order";

interface LocalOrdersState {
  orders: Order[];
  addOrder: (order: Order) => void;
  getOrder: (id: number | string) => Order | undefined;
}

export const useLocalOrders = create<LocalOrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (order) => {
        set((state) => {
          // Keep only newest 20 orders locally to prevent bloat
          const updatedOrders = [order, ...state.orders.filter((o) => o.id !== order.id)].slice(
            0,
            20,
          );
          return { orders: updatedOrders };
        });
      },
      getOrder: (id) => {
        const numId = Number(id);
        return get().orders.find((o) => o.id === numId);
      },
    }),
    {
      name: "local-orders-storage",
    },
  ),
);
