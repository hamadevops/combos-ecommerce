import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryApi } from "@/api/category";
import { CreateCategoryDto, UpdateCategoryDto, Category } from "@/types/category";
import { toast } from "sonner";

export const useCategories = (params?: { page?: number; limit?: number; search?: string }) => {
  return useQuery({
    queryKey: params ? ["categories", params] : ["categories"],
    queryFn: async () => {
      return categoryApi.getList(params);
    },
  });
};

export const useCategoryTree = () => {
  return useQuery({
    queryKey: ["categories", "tree"],
    queryFn: async () => {
      const response = await categoryApi.getTree();
      return (response as any).data || response;
    },
  });
};

export const useCategory = (idOrSlug: number | string) => {
  return useQuery({
    queryKey: ["categories", idOrSlug],
    queryFn: async () => {
      let response;
      if (
        typeof idOrSlug === "number" ||
        (typeof idOrSlug === "string" && /^\d+$/.test(idOrSlug))
      ) {
        response = await categoryApi.getOne(Number(idOrSlug));
      } else {
        response = await categoryApi.getBySlug(String(idOrSlug));
      }
      return (response as any).data || response;
    },
    enabled: !!idOrSlug,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryDto) => categoryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Đã tạo danh mục thành công");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Không thể tạo danh mục");
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoryDto }) =>
      categoryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Đã cập nhật danh mục thành công");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Không thể cập nhật danh mục");
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => categoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Đã xóa danh mục thành công");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Không thể xóa danh mục");
    },
  });
};
