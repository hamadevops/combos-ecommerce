import { apiClient, ApiResponse } from "@/lib/api-client";
import { settingsGetPublicSettings, settingsFindAll } from "@vibe/shared";
import { request } from "@/lib/api-helper";

export interface SettingResponse {
  id: number;
  key: string;
  value: string; // The backend returns string, json values are also strings (JSON.stringified)
  type: string;
  isPublic: boolean;
  group: string;
  label?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type UpdateSettingDto = Partial<Omit<SettingResponse, "id" | "createdAt" | "updatedAt">>;

export const settingsService = {
  // Get all settings (Admin)
  getAll: async (options?: { client?: any }): Promise<SettingResponse[]> => {
    return request<SettingResponse[]>(
      settingsFindAll({
        client: options?.client,
      }) as any,
    );
  },

  // Get public settings (Public)
  getPublic: async (options?: { client?: any }): Promise<Record<string, any>> => {
    const response = await request<any>(
      settingsGetPublicSettings({
        client: options?.client,
      }) as any,
    );
    return response?.data || response;
  },

  // Get one
  getOne: async (id: number): Promise<SettingResponse> => {
    const response = (await apiClient.get<SettingResponse>(
      `/settings/${id}`,
    )) as unknown as ApiResponse<SettingResponse>;
    return response.data;
  },

  // Update
  update: async (id: number, data: UpdateSettingDto): Promise<SettingResponse> => {
    const response = (await apiClient.patch<SettingResponse>(
      `/settings/${id}`,
      data,
    )) as unknown as ApiResponse<SettingResponse>;
    return response.data;
  },
};
