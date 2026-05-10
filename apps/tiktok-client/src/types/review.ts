import { BaseResponse } from "./common";
import {
  ReviewResponseDto as ReviewResponse,
  CreateReviewDto as GenCreateReviewDto,
  ReviewsFindAllResponses,
} from "@vibe/shared";

export type Review = ReviewResponse;
export type CreateReviewDto = GenCreateReviewDto;

// Generated Response for find all
export type ReviewListResponse = ReviewsFindAllResponses;
