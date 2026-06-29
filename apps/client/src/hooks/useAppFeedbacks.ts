import { useQuery } from "@tanstack/react-query";
import { appFeedbackApi } from "@/api/app-feedback";

export const useAppFeedbacks = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["app-feedbacks", params],
    queryFn: () => appFeedbackApi.getList(params),
  });
};
