import {
  topicsFindAll,
  topicsFindTree,
  topicsFindOne,
  topicsCreate,
  topicsUpdate,
  topicsRemove,
} from "@vibe/shared";
import { request } from "@/lib/api-helper";
import { CreateTopicDto, Topic, TopicListResponse, UpdateTopicDto } from "@/types/topic";
import { BaseResponse } from "@/types/common";

export const topicApi = {
  getList: (params?: { page?: number; limit?: number; search?: string }) => {
    return request<TopicListResponse>(
      topicsFindAll({
        query: params,
      }) as any,
    );
  },

  getTree: () => {
    return request<BaseResponse<Topic[]>>(topicsFindTree() as any);
  },

  getOne: (id: number) => {
    return request<BaseResponse<Topic>>(
      topicsFindOne({
        path: { id: String(id) },
      }) as any,
    );
  },

  create: (data: CreateTopicDto) => {
    return request<BaseResponse<Topic>>(
      topicsCreate({
        body: data,
      }) as any,
    );
  },

  update: (id: number, data: UpdateTopicDto) => {
    return request<BaseResponse<Topic>>(
      topicsUpdate({
        path: { id },
        body: data,
      }) as any,
    );
  },

  delete: (id: number) => {
    return request<BaseResponse<void>>(
      topicsRemove({
        path: { id },
      }) as any,
    );
  },
};
