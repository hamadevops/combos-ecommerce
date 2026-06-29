import { tagsFindAll, tagsFindOne, tagsCreate, tagsUpdate, tagsRemove } from "@projects/shared";
import { request } from "@/lib/api-helper";
import { CreateTagDto, Tag, TagListResponse, UpdateTagDto } from "@/types/tag";
import { BaseResponse } from "@/types/common";

export const tagApi = {
  // Get all tags
  getList: (params?: { page?: number; limit?: number; search?: string }) => {
    return request<TagListResponse>(
      tagsFindAll({
        query: params,
      }) as any,
    );
  },

  // Get one tag
  getOne: (id: number) => {
    return request<BaseResponse<Tag>>(
      tagsFindOne({
        path: { id: String(id) },
      }) as any,
    );
  },

  // Create a new tag
  create: (data: CreateTagDto) => {
    return request<BaseResponse<Tag>>(
      tagsCreate({
        body: data,
      }) as any,
    );
  },

  // Update a tag
  update: (id: number, data: UpdateTagDto) => {
    return request<BaseResponse<Tag>>(
      tagsUpdate({
        path: { id },
        body: data,
      }) as any,
    );
  },

  // Delete a tag
  delete: (id: number) => {
    return request<BaseResponse<void>>(
      tagsRemove({
        path: { id },
      }) as any,
    );
  },
};
