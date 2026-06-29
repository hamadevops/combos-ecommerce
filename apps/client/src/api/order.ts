import {
  ordersCreate,
  ordersFindAll,
  ordersFindOne,
  ordersUpdate,
  ordersFindByCode,
} from "@/generated/api";
import { request } from "@/lib/api-helper";
import { CreateOrderDto, OrderResponse, OrderListResponse } from "@/types/order";
import { UpdateOrderDto } from "@/generated/api";

export const orderApi = {
  // Create new order
  create: (data: CreateOrderDto) => {
    return request<OrderResponse>(
      ordersCreate({
        body: data,
      }) as any,
    );
  },

  // Get my orders
  getList: (params?: { page?: number; limit?: number; status?: string }) => {
    return request<OrderListResponse>(
      ordersFindAll({
        query: params,
      } as any) as any,
    );
  },

  // Get order detail by ID
  getOne: (id: number) => {
    return request<OrderResponse>(
      ordersFindOne({
        path: { id },
      }) as any,
    );
  },

  // Get order detail by code (public - no auth required)
  getByCode: (code: string) => {
    return request<OrderResponse>(
      ordersFindByCode({
        path: { code },
      }) as any,
    );
  },

  // Update status
  updateStatus: (id: number, data: UpdateOrderDto) => {
    return request<OrderResponse>(
      ordersUpdate({
        path: { id },
        body: data,
      }) as any,
    );
  },
};
