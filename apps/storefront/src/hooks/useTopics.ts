import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { topicApi } from "@/api/topic";
import { CreateTopicDto, UpdateTopicDto } from "@/types/topic";
import { toast } from "sonner";

export const useTopics = (params?: { page?: number; limit?: number; search?: string }) => {
  return useQuery({
    queryKey: ["topics", params],
    queryFn: () => topicApi.getList(params),
  });
};

export const useTopicTree = () => {
  return useQuery({
    queryKey: ["topics", "tree"],
    queryFn: () => topicApi.getTree(),
  });
};

export const useCreateTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTopicDto) => topicApi.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["topics"] });
      toast.success("Đã tạo chủ đề mới thành công");
    },
    onError: (error: any) => {
      toast.error(error.message || "Có lỗi xảy ra khi tạo chủ đề");
    },
  });
};

export const useUpdateTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTopicDto }) => topicApi.update(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["topics"] });
      toast.success("Đã cập nhật chủ đề thành công");
    },
    onError: (error: any) => {
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật chủ đề");
    },
  });
};

export const useDeleteTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => topicApi.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["topics"] });
      toast.success("Đã xóa chủ đề thành công");
    },
    onError: (error: any) => {
      toast.error(error.message || "Có lỗi xảy ra khi xóa chủ đề");
    },
  });
};
