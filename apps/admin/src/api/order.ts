import { ordersCreate, ordersFindAll, ordersFindOne, ordersUpdate } from "@projects/shared";
import { request } from "@/lib/api-helper";
import { CreateOrderDto, OrderResponse, OrderListResponse } from "@/types/order";
import { UpdateOrderDto } from "@projects/shared";

export const orderApi = {
  // Create new order
  create: (data: CreateOrderDto) => {
    return request<OrderResponse>(
      ordersCreate({
        body: data,
      }) as any,
    );
  },

  // Get list of orders
  getList: (params?: { page?: number; limit?: number; status?: string }) => {
    return request<OrderListResponse>(
      ordersFindAll({
        query: params,
      } as any) as any,
    );
  },

  // Get order detail
  getOne: (id: number) => {
    return request<OrderResponse>(
      ordersFindOne({
        path: { id },
      }) as any,
    );
  },

  // Update order (status, paymentStatus, customer info, shipping, notes)
  update: (id: number, data: UpdateOrderDto) => {
    return request<OrderResponse>(
      ordersUpdate({
        path: { id },
        body: data,
      }) as any,
    );
  },
};
