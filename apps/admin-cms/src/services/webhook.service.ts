import { apiClient, ApiResponse } from "@/lib/api-client";
import { components } from "@/docs/api-types";

export type Webhook = components["schemas"]["Webhook"];
export type CreateWebhookDto = components["schemas"]["CreateWebhookDto"];
export type UpdateWebhookDto = components["schemas"]["UpdateWebhookDto"];

export const webhookService = {
  getAll: async () => {
    const response = (await apiClient.get<Webhook[]>("/webhooks")) as unknown as ApiResponse<
      Webhook[]
    >;
    return response.data;
  },

  getOne: async (id: number) => {
    const response = (await apiClient.get<Webhook>(
      `/webhooks/${id}`,
    )) as unknown as ApiResponse<Webhook>;
    return response.data;
  },

  create: async (data: CreateWebhookDto) => {
    const response = (await apiClient.post<Webhook>(
      "/webhooks",
      data,
    )) as unknown as ApiResponse<Webhook>;
    return response.data;
  },

  update: async (id: number, data: UpdateWebhookDto) => {
    const response = (await apiClient.patch<Webhook>(
      `/webhooks/${id}`,
      data,
    )) as unknown as ApiResponse<Webhook>;
    return response.data;
  },

  delete: async (id: number) => {
    const response = (await apiClient.delete(`/webhooks/${id}`)) as unknown as ApiResponse<any>;
    return response.data;
  },
};
