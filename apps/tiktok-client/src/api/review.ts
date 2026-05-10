import { reviewsFindAll, reviewsCreate, reviewsRemove } from "@vibe/shared";
import { request } from "@/lib/api-helper";
import { CreateReviewDto, Review } from "@/types/review";
import { BaseResponse } from "@/types/common";

export const reviewApi = {
  getList: (productId?: number) => {
    return request<Review[]>(
      reviewsFindAll({
        query: {
          productId: productId!,
          page: 1,
          limit: 100,
        },
      }) as any,
    );
  },

  create: (data: CreateReviewDto) => {
    return request<Review>(
      reviewsCreate({
        body: data,
      }) as any,
    );
  },

  delete: (id: number) => {
    return request<void>(
      reviewsRemove({
        path: { id },
      }) as any,
    );
  },
};
