import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postApi } from "@/api/post";
import { CreatePostDto, UpdatePostDto } from "@/types/post";
import { toast } from "sonner";
import { PostsFindAllData } from "@projects/shared";

export const usePosts = (params?: PostsFindAllData["query"]) => {
  return useQuery({
    queryKey: ["posts", params],
    queryFn: () => postApi.getList(params as any),
  });
};

export const usePost = (idOrSlug: number | string) => {
  return useQuery({
    queryKey: ["post", idOrSlug],
    queryFn: () => postApi.getOne(idOrSlug),
    enabled: !!idOrSlug,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePostDto) => postApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Tạo bài viết thành công");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi tạo bài viết");
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePostDto }) => postApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", variables.id] });
      toast.success("Cập nhật bài viết thành công");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi cập nhật bài viết");
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => postApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Xóa bài viết thành công");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi xóa bài viết");
    },
  });
};
