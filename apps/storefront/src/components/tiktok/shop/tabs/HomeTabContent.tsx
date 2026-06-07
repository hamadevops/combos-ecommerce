"use client";

import { useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import BannerCarousel from "@/components/tiktok/shop/BannerCarousel";
import ProductRow from "@/components/tiktok/products/ProductRow";
import CategoryCard from "@/components/tiktok/categories/CategoryCard";

interface HomeTabContentProps {
  isLoadingCats: boolean;
  isLoadingNew: boolean;
  isLoadingFeatured: boolean;
  isLoadingAll: boolean;
  categoryList: any[];
  newList: any[];
  featuredList: any[];
  productList: any[];
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
}

export default function HomeTabContent({
  isLoadingCats,
  isLoadingNew,
  isLoadingFeatured,
  isLoadingAll,
  categoryList,
  newList,
  featuredList,
  productList,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
}: HomeTabContentProps) {
  const router = useRouter();

  // Intersection Observer for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoadingAll || isFetchingNextPage) return;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage && fetchNextPage) {
          fetchNextPage();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoadingAll, isFetchingNextPage, hasNextPage, fetchNextPage],
  );

  return (
    <div className="space-y-4 py-4 bg-background">
      <BannerCarousel />

      {isLoadingNew ? (
        <div className="flex justify-center p-4">
          <Loader2 className="animate-spin w-6 h-6 text-primary" />
        </div>
      ) : (
        <ProductRow
          title="Mới ra"
          products={newList.slice(0, 4)}
          layout="grid"
          viewAllLink="/san-pham"
        />
      )}

      <section className="space-y-3">
        <h2 className="font-bold text-lg px-4">Danh mục</h2>
        {isLoadingCats ? (
          <div className="flex justify-center p-4">
            <Loader2 className="animate-spin w-6 h-6 text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3 px-4">
            {categoryList.slice(0, 8).map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </section>

      {isLoadingFeatured ? (
        <div className="flex justify-center p-4">
          <Loader2 className="animate-spin w-6 h-6 text-primary" />
        </div>
      ) : (
        <ProductRow
          title="Hàng tuyển cho bạn"
          products={featuredList.slice(0, 4)}
          layout="grid"
          viewAllLink="/san-pham"
        />
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 px-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <h2 className="text-primary font-medium">Đề xuất cho bạn</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>
        {isLoadingAll ? (
          <div className="flex justify-center p-4">
            <Loader2 className="animate-spin w-6 h-6 text-primary" />
          </div>
        ) : (
          <ProductRow products={productList.slice(0, 12)} layout="grid" />
        )}

        {/* Load More Trigger or View More Button */}
        {(!isLoadingAll || productList.length > 0) && (
          <>
            {productList.length < 12 && hasNextPage && (
              <div ref={loadMoreRef} className="flex justify-center py-4">
                {isFetchingNextPage && <Loader2 className="animate-spin w-6 h-6 text-primary" />}
              </div>
            )}
            {(productList.length >= 12 || (!hasNextPage && productList.length > 0)) && (
              <div className="flex justify-center py-4">
                <button
                  onClick={() => router.push("/san-pham")}
                  className="px-6 py-2 rounded-full text-primary font-medium text-sm transition-colors hover:bg-primary/5"
                >
                  Xem thêm
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
