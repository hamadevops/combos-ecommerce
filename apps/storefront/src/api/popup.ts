import {
  popupsFindAll,
  popupsFindActive,
  popupsCreate,
  popupsUpdate,
  popupsRemove,
} from "@/generated/api";
import { request } from "@/lib/api-helper";
import { CreatePopupDto, UpdatePopupDto, Popup } from "@/types/popup";
import { BaseResponse } from "@/types/common";

export const popupApi = {
  getList: (params?: any, options?: { client?: any }) => {
    // params might be page, limit, etc.
    return request<Popup[]>(
      popupsFindAll({
        client: options?.client,
        query: params,
      }) as any,
    );
  },

  getActive: async (options?: { client?: any }) => {
    const response = await request<any>(
      popupsFindActive({
        client: options?.client,
      }) as any,
    );
    return response?.data || response;
  },

  create: (data: CreatePopupDto) => {
    // Generated client uses formDataBodySerializer usually?
    // Check sdk.gen.ts Step 258 output (not shown, but others used it).
    // If generated handles formData, we check if DTO allows File or we need to pass manual FormData.
    // If DTO has string/File fields, client serializer handles it.
    return request<Popup>(
      popupsCreate({
        body: data,
      }) as any,
    );
  },

  update: (id: number, data: UpdatePopupDto) => {
    return request<Popup>(
      popupsUpdate({
        path: { id },
        body: data,
      }) as any,
    );
  },

  delete: (id: number) => {
    return request<void>(
      popupsRemove({
        path: { id },
      }) as any,
    );
  },
};
