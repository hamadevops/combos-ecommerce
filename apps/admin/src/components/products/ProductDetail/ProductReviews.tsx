import { useState } from "react";
import { ChevronRight, Star, Loader2 } from "lucide-react";
import { Product } from "@/types/product";
import { useReviews } from "@/hooks/useReviews";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/lib/utils";
import { format } from "date-fns";

interface ProductReviewsProps {
  product: Product;
}

const REVIEWS_PER_PAGE = 3;

export default function ProductReviews({ product }: ProductReviewsProps) {
  const { data: reviewsData, isLoading } = useReviews(product.id);
  const reviews = reviewsData?.data || [];
  const reviewCount = reviews.length;

  const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE);
  const visibleReviews = reviews.slice(0, visibleCount);
  const hasMore = visibleCount < reviewCount;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + REVIEWS_PER_PAGE);
  };

  if (isLoading) {
    return (
      <div id="reviews" className="bg-background scroll-mt-[100px]">
        <div className="px-4 py-3 border-t border-border">
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="reviews" className="bg-background scroll-mt-[100px]">
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-base">Đánh giá của khách hàng ({reviewCount})</h3>
        </div>

        {reviewCount === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-4">Chưa có đánh giá nào</div>
        ) : (
          <div className="space-y-3">
            {visibleReviews.map((review) => (
              <div key={review.id} className="flex gap-3 py-2">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  {review.reviewerAvatar && (
                    <AvatarImage
                      src={getImageUrl(review.reviewerAvatar)}
                      alt={review.reviewerName}
                    />
                  )}
                  <AvatarFallback className="text-xs">
                    {review.reviewerName?.charAt(0).toUpperCase() || "K"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm truncate">
                      {review.reviewerName || "Khách hàng"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(review.createdAt), "dd/MM/yyyy")}
                    </span>
                  </div>
                  <div className="flex mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/80">{review.comment}</p>
                  {review.image && (
                    <img
                      src={getImageUrl(review.image)}
                      alt="Review"
                      className="w-16 h-16 object-cover rounded mt-2"
                    />
                  )}
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLoadMore}
                  className="text-muted-foreground"
                >
                  Tải thêm đánh giá
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
