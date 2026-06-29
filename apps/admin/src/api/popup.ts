import {
  popupsFindAll,
  popupsFindActive,
  popupsCreate,
  popupsUpdate,
  popupsRemove,
} from "@projects/shared";
import { request } from "@/lib/api-helper";
import { CreatePopupDto, UpdatePopupDto, Popup } from "@/types/popup";
import { BaseResponse } from "@/types/common";

export const popupApi = {
  getList: (params?: any) => {
    // params might be page, limit, etc.
    return request<Popup[]>(
      popupsFindAll({
        query: params,
      }) as any,
    );
  },

  getActive: () => {
    return request<Popup>(popupsFindActive() as any);
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
