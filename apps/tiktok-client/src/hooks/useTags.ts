import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tagApi } from "@/api/tag";
import { CreateTagDto, UpdateTagDto } from "@/types/tag";
import { toast } from "sonner";

export const useTags = (params?: { page?: number; limit?: number; search?: string }) => {
  return useQuery({
    queryKey: ["tags", params],
    queryFn: () => tagApi.getList(params),
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTagDto) => tagApi.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success("Đã tạo thẻ mới thành công");
    },
    onError: (error: any) => {
      toast.error(error.message || "Có lỗi xảy ra khi tạo thẻ");
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTagDto }) => tagApi.update(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success("Đã cập nhật thẻ thành công");
    },
    onError: (error: any) => {
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật thẻ");
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => tagApi.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success("Đã xóa thẻ thành công");
    },
    onError: (error: any) => {
      toast.error(error.message || "Có lỗi xảy ra khi xóa thẻ");
    },
  });
};
