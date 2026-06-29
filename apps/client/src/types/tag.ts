import { BaseResponse } from "./common";
import {
  TagResponse,
  CreateTagDto as GenCreateTagDto,
  UpdateTagDto as GenUpdateTagDto,
  TagListResponseDto,
} from "@/generated/api";

export type Tag = TagResponse;
export type CreateTagDto = GenCreateTagDto;
export type UpdateTagDto = GenUpdateTagDto;
export type TagListResponse = TagListResponseDto;
