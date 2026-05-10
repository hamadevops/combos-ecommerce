import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { popupApi } from "@/api/popup";
import { Popup, CreatePopupDto, UpdatePopupDto } from "@/types/popup";
import { toast } from "sonner";

export const useActivePopup = () => {
  return useQuery({
    queryKey: ["popup", "active"],
    queryFn: async () => {
      const response = await popupApi.getActive();
      return (response as any).data || response;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const usePopups = (params?: any) => {
  return useQuery({
    queryKey: ["popups", params],
    queryFn: async () => {
      const response = await popupApi.getList(params);
      return (response as any).data || response;
    },
  });
};

export const useCreatePopup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePopupDto) => popupApi.create(data),
    onSuccess: () => {
      toast.success("Thêm popup thành công");
      queryClient.invalidateQueries({ queryKey: ["popups"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Lỗi khi thêm popup");
    },
  });
};

export const useUpdatePopup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePopupDto }) => popupApi.update(id, data),
    onSuccess: () => {
      toast.success("Cập nhật popup thành công");
      queryClient.invalidateQueries({ queryKey: ["popups"] });
      queryClient.invalidateQueries({ queryKey: ["popup", "active"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật popup");
    },
  });
};

export const useDeletePopup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => popupApi.delete(id),
    onSuccess: () => {
      toast.success("Xóa popup thành công");
      queryClient.invalidateQueries({ queryKey: ["popups"] });
      queryClient.invalidateQueries({ queryKey: ["popup", "active"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Lỗi khi xóa popup");
    },
  });
};
