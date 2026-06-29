import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewApi } from "@/api/review";
import { Review, CreateReviewDto } from "@/types/review";
import { toast } from "sonner";

export const useReviews = (productId?: number) => {
  return useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const response = await reviewApi.getList(productId);
      // API returns { data: Review[], ... } - extract the data array
      return { data: (response as any)?.data || response || [] };
    },
    enabled: !!productId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewDto) => reviewApi.create(data),
    onSuccess: (data: any) => {
      toast.success("Đã thêm đánh giá thành công");
      // Assuming data contains the review or we use input productId
      // data might be wrapped in BaseResponse
      const review = (data as any).data || data;
      if (review.productId) {
        queryClient.invalidateQueries({ queryKey: ["reviews", review.productId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["reviews"] });
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi thêm đánh giá");
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => reviewApi.delete(id),
    onSuccess: () => {
      toast.success("Đã xóa đánh giá thành công");
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi xóa đánh giá");
    },
  });
};
