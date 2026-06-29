import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryApi } from "@/api/category";
import { CreateCategoryDto, UpdateCategoryDto, Category } from "@/types/category";
import { toast } from "sonner";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await categoryApi.getList();
      // CategoryListResponse might be { data: Category[] } or just Category[] or { data: { items... } }
      // The generated API usually returns the response body directly.
      // If categoryApi.getList returns CategoryListResponse properly typed, we just return it.
      // If the UI expects a specific structure (e.g. array), we adapt here.

      // Safe check: return data if it exists, else response.
      return (response as any).data?.items || (response as any).data || response;
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
      toast.success("Category created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create category");
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
      toast.success("Category updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update category");
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => categoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete category");
    },
  });
};
