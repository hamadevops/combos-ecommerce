import { useState, useRef, useEffect } from "react";
import { ChevronRight, ChevronLeft, Star, Loader2 } from "lucide-react";
import { Product } from "@/types/product";
import { useReviews } from "@/hooks/useReviews";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/tiktok/ui/avatar";
import { Button } from "@/components/tiktok/ui/button";
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

  // Fullscreen support logic
  const reviewsWithImages = reviews.filter((r: any) => !!r.image);
  const [fullscreenReviewIndex, setFullscreenReviewIndex] = useState<number | null>(null);
  const [activeScreenIndex, setActiveScreenIndex] = useState(0);
  const fullscreenScrollRef = useRef<HTMLDivElement>(null);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + REVIEWS_PER_PAGE);
  };

  useEffect(() => {
    if (fullscreenReviewIndex !== null) {
      document.body.style.overflow = "hidden";
      setActiveScreenIndex(fullscreenReviewIndex);
      // Wait for dom to render the fullscreen container
      setTimeout(() => {
        if (fullscreenScrollRef.current) {
          const width = fullscreenScrollRef.current.clientWidth;
          fullscreenScrollRef.current.scrollTo({
            left: width * fullscreenReviewIndex,
            behavior: "instant",
          });
        }
      }, 10);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [fullscreenReviewIndex]);

  const scrollPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeScreenIndex > 0 && fullscreenScrollRef.current) {
      const width = fullscreenScrollRef.current.clientWidth;
      fullscreenScrollRef.current.scrollTo({
        left: width * (activeScreenIndex - 1),
        behavior: "smooth",
      });
    }
  };

  const scrollNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeScreenIndex < reviewsWithImages.length - 1 && fullscreenScrollRef.current) {
      const width = fullscreenScrollRef.current.clientWidth;
      fullscreenScrollRef.current.scrollTo({
        left: width * (activeScreenIndex + 1),
        behavior: "smooth",
      });
    }
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

  const activeReview = reviewsWithImages[activeScreenIndex];

  return (
    <>
      <div id="reviews" className="bg-background scroll-mt-[100px]">
        <div className="px-4 py-3 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base">Đánh giá của khách hàng ({reviewCount})</h2>
          </div>

          {reviewCount === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-4">
              Chưa có đánh giá nào
            </div>
          ) : (
            <div className="space-y-3">
              {visibleReviews.map((review: any) => (
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
                        loading="lazy"
                        decoding="async"
                        src={getImageUrl(review.image) || "https://placehold.co/100"}
                        alt="Review"
                        className="w-16 h-16 object-cover rounded mt-2 cursor-zoom-in"
                        onClick={() => {
                          const idx = reviewsWithImages.findIndex((r: any) => r.id === review.id);
                          if (idx !== -1) setFullscreenReviewIndex(idx);
                        }}
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

      {/* Fullscreen Image Viewer Modal */}
      {fullscreenReviewIndex !== null && activeReview && (
        <div
          className="fixed inset-0 z-[200] flex flex-col bg-black/95 animate-in fade-in duration-200"
          onClick={() => setFullscreenReviewIndex(null)}
        >
          <div className="absolute top-4 right-4 z-[201] p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          {/* Desktop Navigation Controls */}
          <div className="absolute inset-y-0 left-0 right-0 hidden md:flex items-center justify-between px-4 pointer-events-none z-[201]">
            <button
              onClick={scrollPrev}
              disabled={activeScreenIndex === 0}
              className="p-3 rounded-full bg-black/50 hover:bg-black/70 text-white pointer-events-auto transition-colors disabled:opacity-0 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={scrollNext}
              disabled={activeScreenIndex === reviewsWithImages.length - 1}
              className="p-3 rounded-full bg-black/50 hover:bg-black/70 text-white pointer-events-auto transition-colors disabled:opacity-0 disabled:pointer-events-none"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div
            ref={fullscreenScrollRef}
            className="flex-1 w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
            onScroll={(e) => {
              const scrollLeft = e.currentTarget.scrollLeft;
              const width = e.currentTarget.clientWidth;
              if (width === 0) return;
              setActiveScreenIndex(Math.round(scrollLeft / width));
            }}
          >
            {reviewsWithImages.map((rv: any, index: number) => (
              <div
                key={rv.id}
                className="w-full h-full flex-shrink-0 snap-center snap-always relative flex items-center justify-center p-4"
              >
                <img
                  loading="lazy"
                  decoding="async"
                  src={getImageUrl(rv.image)!}
                  alt={`Review ${index}`}
                  className="max-w-full max-h-full object-contain cursor-zoom-out"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            ))}
          </div>

          {/* Active Review Comment Overlay */}
          <div className="absolute bottom-0 left-0 right-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent pt-12 pb-8 px-6 text-white pointer-events-none">
            <div className="pointer-events-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-white/20">
                    {activeReview.reviewerAvatar && (
                      <AvatarImage src={getImageUrl(activeReview.reviewerAvatar)} />
                    )}
                    <AvatarFallback className="text-black">
                      {activeReview.reviewerName?.charAt(0).toUpperCase() || "K"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{activeReview.reviewerName || "Khách hàng"}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < activeReview.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-500"
                          }`}
                        />
                      ))}
                      <span className="text-white/60 text-xs ml-2">
                        {format(new Date(activeReview.createdAt), "dd/MM/yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-sm font-medium text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
                  {activeScreenIndex + 1} / {reviewsWithImages.length}
                </div>
              </div>
              <p className="text-sm leading-relaxed text-white/90 max-h-32 overflow-y-auto w-[90%] font-medium drop-shadow-md">
                {activeReview.comment}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
