import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "@/api/order";
import { CreateOrderDto } from "@/types/order";
import { toast } from "sonner";

export const useOrders = (params?: { page?: number; limit?: number; status?: string }) => {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: async () => {
      try {
        const response = await orderApi.getList(params);
        return (response as any).data || response;
      } catch {
        return [];
      }
    },
    retry: false,
  });
};

export const useOrderDetail = (id: number) => {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: async () => {
      try {
        const response = await orderApi.getOne(id);
        return (response as any).data || response;
      } catch {
        return null;
      }
    },
    enabled: !!id,
    retry: false,
  });
};

export const useOrderDetailByCode = (code: string) => {
  return useQuery({
    queryKey: ["orders", "code", code],
    queryFn: async () => {
      try {
        const response = await orderApi.getByCode(code);
        return (response as any).data || response;
      } catch {
        return null;
      }
    },
    enabled: !!code,
    retry: false,
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

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      paymentStatus,
    }: {
      id: number;
      status?: any;
      paymentStatus?: any;
    }) => orderApi.updateStatus(id, { status, paymentStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Cập nhật trạng thái thành công");
    },
    onError: (error: any) => {
      toast.error(error.message || "Cập nhật thất bại");
    },
  });
};
