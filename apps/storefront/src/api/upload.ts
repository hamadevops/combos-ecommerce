import { uploadUploadFile } from "@/generated/api";
import { request } from "@/lib/api-helper";

export interface UploadResponse {
  url: string;
}

export const uploadApi = {
  // Upload single file to MinIO
  uploadFile: async (file: File): Promise<string> => {
    const response = await request<any>(
      uploadUploadFile({
        body: {
          file: file,
        },
      }) as any,
    );

    // Response might be { url: string } or { data: { url: string } } depending on generated type.
    // Generated 'UploadResponseDto' has 'url'.
    // If wrapped in BaseResponse, it would be data.url.
    // Manual code handled both.
    return response?.url || response?.data?.url || "";
  },
};
