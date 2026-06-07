import { pagesFindAll, pagesFindOne } from "@/generated/api";
import { request } from "@/lib/api-helper";
import { Page } from "@/types/page";
import { BaseResponse } from "@/types/common";

export const pageApi = {
  // Get all pages
  getList: (options?: any) => {
    return request<BaseResponse<Page[]>>(
      pagesFindAll(options) as any,
    );
  },

  // Get one page by ID or Slug
  getOne: (idOrSlug: string | number, options?: any) => {
    return request<BaseResponse<Page>>(
      pagesFindOne({
        path: { id: String(idOrSlug) },
        ...options,
      }) as any,
    );
  },
};
