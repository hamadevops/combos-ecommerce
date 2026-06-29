import { apiClient } from "@/lib/api-client";

export interface AppFeedback {
  id: number;
  customerName?: string;
  customerAvatar?: string;
  content?: string;
  rating: number;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface AppFeedbackListResponse {
  items: AppFeedback[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const appFeedbackApi = {
  getList: (params?: { page?: number; limit?: number }) => {
    return apiClient.get<AppFeedbackListResponse>("/app-feedbacks", { params });
  },
};
