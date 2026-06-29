import { postsFindAll, postsFindOne, postsCreate, postsUpdate, postsRemove } from "@projects/shared";
import { request } from "@/lib/api-helper";
import { CreatePostDto, UpdatePostDto, Post, PostListResponse } from "@/types/post";
import { BaseResponse } from "@/types/common";
import { apiClient } from "@/lib/api-client"; // Fallback

export const postApi = {
  // Get all posts
  getList: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    topic_id?: number;
    author_id?: number;
    is_published?: boolean;
  }) => {
    return request<PostListResponse>(
      postsFindAll({
        query: params as any,
      }) as any,
    );
  },

  // Get one post
  getOne: (idOrSlug: number | string) => {
    return request<BaseResponse<Post>>(
      postsFindOne({
        path: { idOrSlug } as any,
      }) as any,
    );
  },

  // Create a new post
  create: (data: CreatePostDto) => {
    // Generated client uses formDataBodySerializer which handles Object -> FormData conversion.
    // 'data' has thumbnail: Blob | File.
    // We can pass data directly to 'body'.
    return request<BaseResponse<Post>>(
      postsCreate({
        body: data as any,
      }) as any,
    );
  },

  // Update a post
  update: (id: number, data: UpdatePostDto) => {
    return request<BaseResponse<Post>>(
      postsUpdate({
        path: { id },
        body: data as any,
      }) as any,
    );
  },

  // Delete a post
  delete: (id: number) => {
    return request<BaseResponse<void>>(
      postsRemove({
        path: { id },
      }) as any,
    );
  },
};
