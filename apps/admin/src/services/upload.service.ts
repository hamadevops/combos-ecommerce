import { apiClient, ApiResponse } from "@/lib/api-client";

export const uploadService = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    // The backend returns an ApiResponse<{ url: string }>
    const response = (await apiClient.post<{ url: string }>("/upload/file", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })) as unknown as ApiResponse<{ url: string }>;

    return response.data.url;
  },
};
