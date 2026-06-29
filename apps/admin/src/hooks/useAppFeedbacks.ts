import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  appFeedbacksFindAllAdmin,
  appFeedbacksCreate,
  appFeedbacksUpdate,
  appFeedbacksRemove,
  appFeedbacksFindOne,
} from "@projects/shared";
import { request } from "@/lib/api-helper";
import {
  AppFeedbacksFindAllAdminResponse,
  AppFeedbackResponseDto,
} from "@projects/shared";

export const useAppFeedback = (id: number) => {
  return useQuery({
    queryKey: ["app-feedbacks", id],
    queryFn: () =>
      request<AppFeedbackResponseDto>(
        appFeedbacksFindOne({
          path: { id },
        }) as any,
      ),
    enabled: !!id,
  });
};


export const useAppFeedbacks = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}) => {
  return useQuery({
    queryKey: ["app-feedbacks", params],
    queryFn: () =>
      request<AppFeedbacksFindAllAdminResponse>(
        appFeedbacksFindAllAdmin({
          query: params as any,
        }) as any,
      ),
  });
};

export const useCreateAppFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      request<AppFeedbackResponseDto>(
        appFeedbacksCreate({
          body: data,
        }) as any,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-feedbacks"] });
    },
  });
};

export const useUpdateAppFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      request<AppFeedbackResponseDto>(
        appFeedbacksUpdate({
          path: { id },
          body: data,
        }) as any,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-feedbacks"] });
    },
  });
};

export const useDeleteAppFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      request(
        appFeedbacksRemove({
          path: { id },
        }) as any,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-feedbacks"] });
    },
  });
};
