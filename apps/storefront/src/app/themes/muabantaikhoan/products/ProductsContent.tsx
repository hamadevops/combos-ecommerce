"use client";

import PageLayout from "@/components/tiktok/layout/PageLayout";
import ProductCard from "@/components/tiktok/products/ProductCard";
import { useInfiniteProducts } from "@/hooks/useProducts";
import { Filter, ChevronDown, Loader2 } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import ShopHeader from "@/components/tiktok/shop/ShopHeader";

const ProductsContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchTerm = searchParams?.get("search") || undefined;
  const categoryIdParam = searchParams?.get("categoryId");
  const categoryIds = categoryIdParam ? [Number(categoryIdParam)] : undefined;

  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [sortValue, setSortValue] = useState<string>("display_order_asc"); // Default

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteProducts({
    search: searchTerm,
    categoryIds,
    sort: sortValue || undefined,
    limit: 12,
  });

  // Flatten all pages into single products array
  const products = data?.pages.flatMap((page) => (page as any).data || []) || [];

  // Intersection Observer for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isFetchingNextPage) return;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage],
  );

  const handleSortChange = (type: string) => {
    if (type === "price_asc") {
      setSortValue("price_asc");
    } else if (type === "price_desc") {
      setSortValue("price_desc");
    } else if (type === "newest") {
      setSortValue("newest");
    } else if (type === "bestseller") {
      setSortValue("best_selling");
    } else {
      setSortValue("display_order_asc"); // "all" - default sorting
    }
    setActiveFilter(type);
  };

  return (
    <PageLayout headerProps={{ showSearch: true, showBack: true }}>
      <div className="space-y-4 py-4 min-h-screen">
        {/* Filters */}
        <div className="flex items-center gap-2 px-4 overflow-x-auto scrollbar-hide">
          <button className="flex items-center gap-1 px-3 py-1.5 bg-secondary rounded-full text-sm whitespace-nowrap">
            <Filter className="w-4 h-4" />
            Bộ lọc
          </button>

          <button
            onClick={() => handleSortChange("all")}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${activeFilter === "all" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
          >
            Tất cả
          </button>
          <button
            onClick={() => handleSortChange("bestseller")}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${activeFilter === "bestseller" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
          >
            Bán chạy
          </button>
          <button
            onClick={() => handleSortChange("newest")}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${activeFilter === "newest" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
          >
            Mới nhất
          </button>
          <button
            onClick={() =>
              handleSortChange(activeFilter === "price_asc" ? "price_desc" : "price_asc")
            }
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${["price_asc", "price_desc"].includes(activeFilter) ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
          >
            Giá
            <ChevronDown
              className={`w-4 h-4 transition-transform ${activeFilter === "price_asc" ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="animate-spin w-8 h-8 text-primary" />
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-2 px-2">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Load More Trigger */}
            <div ref={loadMoreRef} className="flex justify-center py-4">
              {isFetchingNextPage && <Loader2 className="animate-spin w-6 h-6 text-primary" />}
              {!hasNextPage && products.length > 0 && (
                <p className="text-sm text-muted-foreground">Đã hiển thị tất cả sản phẩm</p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-10 text-muted-foreground">Không tìm thấy sản phẩm nào</div>
        )}
      </div>
    </PageLayout>
  );
};

export default ProductsContent;
