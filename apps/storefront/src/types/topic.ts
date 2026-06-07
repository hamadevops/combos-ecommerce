import { BaseResponse } from "./common";
import {
  TopicResponse,
  CreateTopicDto as GenCreateTopicDto,
  UpdateTopicDto as GenUpdateTopicDto,
  TopicListResponseDto,
} from "@/generated/api";

export type Topic = TopicResponse & {
  children?: Topic[]; // Tree structure support
  description?: string;
  isActive?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  parentId?: number;
  level?: number; // UI helper
};
export type CreateTopicDto = GenCreateTopicDto;
export type UpdateTopicDto = GenUpdateTopicDto;
export type TopicListResponse = TopicListResponseDto;
