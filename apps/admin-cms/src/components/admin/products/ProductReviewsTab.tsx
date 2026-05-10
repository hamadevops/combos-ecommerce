import { useState } from "react";
import { useReviews, useCreateReview, useDeleteReview } from "@/hooks/useReviews";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Plus, Star, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Control } from "react-hook-form";
import { ImageUpload } from "@/components/common/ImageUpload";
import { apiClient } from "@/lib/api-client";
import { getImageUrl } from "@/lib/utils";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

// Validation Schema
const reviewSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(1, "Nội dung đánh giá không được để trống"),
  reviewerName: z.string().min(1, "Tên người đánh giá không được để trống"),
  reviewerAvatar: z.any().optional(),
  image: z.any().optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ProductReviewsTabProps {
  productId: number;
  control: Control<any>;
}

export function ProductReviewsTab({ productId }: ProductReviewsTabProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      comment: "",
      reviewerName: "",
      reviewerAvatar: undefined,
      image: undefined,
    },
  });

  const { data: reviewsData, isLoading } = useReviews(productId);
  const reviews = reviewsData?.data || [];

  const createReviewMutation = useCreateReview();
  const { mutate: deleteReview } = useDeleteReview();

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post<any>("/upload/file", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    // API returns { url: "..." } - extract the URL string
    return response.data?.url || response.data;
  };

  const onSubmit = async (data: ReviewFormData) => {
    setIsUploading(true);
    try {
      let avatarUrl = undefined;
      if (data.reviewerAvatar instanceof File) {
        avatarUrl = await uploadFile(data.reviewerAvatar);
      } else if (typeof data.reviewerAvatar === "string") {
        avatarUrl = data.reviewerAvatar;
      }

      let imageUrl = undefined;
      // Assuming 'data.image' will be available from the form data
      // The current schema uses 'images' (array), this part assumes 'image' (single)
      if ((data as any).image) {
        // Cast to any to access 'image' if schema not updated yet
        if ((data as any).image instanceof File) {
          imageUrl = await uploadFile((data as any).image);
        } else if (typeof (data as any).image === "string") {
          imageUrl = (data as any).image;
        }
      }

      createReviewMutation.mutate(
        {
          productId: Number(productId),
          rating: Number(data.rating),
          comment: data.comment,
          reviewerName: data.reviewerName,
          reviewerAvatar: avatarUrl,
          image: imageUrl, // Changed from 'images' to 'image'
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
            toast.success("Đánh giá đã được thêm");
            // Assuming setIsFormOpen is the new state setter for the form visibility
            // The original code uses setIsAdding, which might need to be renamed by the user
            setIsAdding(false); // Changed from setIsFormOpen(false) to setIsAdding(false) to match existing state variable
            reset();
          },
          onError: (error) => {
            toast.error("Có lỗi xảy ra khi thêm đánh giá");
            console.error(error);
          },
        },
      );
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi upload ảnh"); // Updated error message
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin h-6 w-6" />
      </div>
    );
  }

  const averageRating = reviews?.length
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Đánh giá sản phẩm</h3>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-2xl font-bold text-foreground">{averageRating}</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${star <= Number(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                />
              ))}
            </div>
            <span>({reviews?.length || 0} đánh giá)</span>
          </div>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Thêm đánh giá
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="reviewerName">Tên người đánh giá</Label>
                  <Input
                    id="reviewerName"
                    {...register("reviewerName")}
                    placeholder="Nhập tên khách hàng"
                  />
                  {errors.reviewerName && (
                    <p className="text-destructive text-sm">{errors.reviewerName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rating">Số sao (1-5)</Label>
                  <Input id="rating" type="number" min="1" max="5" {...register("rating")} />
                  {errors.rating && (
                    <p className="text-destructive text-sm">{errors.rating.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Avatar khách hàng</Label>
                <Controller
                  name="reviewerAvatar"
                  control={control}
                  render={({ field }) => (
                    <ImageUpload
                      value={field.value ? [field.value] : []}
                      onChange={(val) => {
                        const file = Array.isArray(val) ? val[0] : val;
                        field.onChange(file);
                      }}
                      multiple={false}
                      maxFiles={1}
                      compact={true}
                      className="w-32 h-32"
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">Nội dung đánh giá</Label>
                <Textarea
                  id="comment"
                  {...register("comment")}
                  placeholder="Nhập nội dung đánh giá..."
                />
                <p className="text-destructive text-sm">
                  {errors.comment && errors.comment.message}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Hình ảnh đánh giá</Label>
                <Controller
                  name="image"
                  control={control}
                  render={({ field }) => (
                    <ImageUpload
                      value={field.value ? [field.value] : []}
                      onChange={(val) => {
                        const file = Array.isArray(val) ? val[0] : val;
                        field.onChange(file);
                      }}
                      multiple={false}
                      maxFiles={1}
                    />
                  )}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={createReviewMutation.isPending || isUploading}>
                  {(createReviewMutation.isPending || isUploading) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Lưu đánh giá
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {reviews?.map((review) => (
          <div key={review.id} className="flex gap-4 p-4 border rounded-lg bg-card/50">
            <Avatar className="h-10 w-10">
              {review.reviewerAvatar && (
                <AvatarImage src={getImageUrl(review.reviewerAvatar)} alt={review.reviewerName} />
              )}
              <AvatarFallback>{review.reviewerName?.charAt(0).toUpperCase() || "G"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="font-medium">{review.reviewerName || "Khách vãng lai"}</div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(review.createdAt), "dd/MM/yyyy HH:mm")}
                </div>
              </div>
              <div className="flex text-yellow-400">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
              </div>
              <p className="text-sm text-foreground/80">{review.comment}</p>
              {review.image && (
                <div className="mt-2">
                  <img
                    src={getImageUrl(review.image)}
                    alt="Review"
                    className="w-20 h-20 object-cover rounded-md border"
                  />
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => {
                if (confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
                  deleteReview(review.id);
                }
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}

        {reviews?.length === 0 && !isAdding && (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            Chưa có đánh giá nào.
          </div>
        )}
      </div>
    </div>
  );
}
