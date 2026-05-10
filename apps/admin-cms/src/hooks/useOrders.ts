import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "@/api/order";
import { CreateOrderDto, OrderResponse, OrderListResponse } from "@/types/order";
import { UpdateOrderDto } from "@vibe/shared";
import { toast } from "sonner";

export const useOrders = (params?: { page?: number; limit?: number; status?: string }) => {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: async () => {
      const response = await orderApi.getList(params);
      return (response as any).data || response;
    },
  });
};

export const useOrderDetail = (id: number) => {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: async () => {
      const response = await orderApi.getOne(id);
      return (response as any).data || response;
    },
    enabled: !!id,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrderDto) => orderApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Đặt hàng thành công!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Đặt hàng thất bại");
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateOrderDto }) =>
      orderApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Cập nhật đơn hàng thành công");
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Cập nhật thất bại";
      toast.error(msg);
    },
  });
};

// Keep legacy alias for backward compatibility
export const useUpdateOrderStatus = useUpdateOrder;
