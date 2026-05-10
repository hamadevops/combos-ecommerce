import { BaseResponse } from "./common";
import {
  PostResponse,
  CreatePostDto as GenCreatePostDto,
  UpdatePostDto as GenUpdatePostDto,
  PostListResponseDto,
} from "@vibe/shared";

// Alias generated types
export type Post = PostResponse;
export type CreatePostDto = GenCreatePostDto;
export type UpdatePostDto = GenUpdatePostDto;

// List Response
export type PostListResponse = PostListResponseDto;
