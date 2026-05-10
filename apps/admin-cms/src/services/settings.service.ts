import { apiClient, ApiResponse } from "@/lib/api-client";

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
  getAll: async (): Promise<SettingResponse[]> => {
    const response = (await apiClient.get<SettingResponse[]>(
      "/settings",
    )) as unknown as ApiResponse<SettingResponse[]>;
    return response.data;
  },

  // Get public settings (Public)
  getPublic: async (): Promise<Record<string, any>> => {
    const response = (await apiClient.get<Record<string, any>>(
      "/settings/public",
    )) as unknown as ApiResponse<Record<string, any>>;
    return response.data;
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
