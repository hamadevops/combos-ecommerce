"use client";

import { useParams, useRouter } from "next/navigation";
import PageLayout from "@/components/tiktok/layout/PageLayout";
import ProductCard from "@/components/tiktok/products/ProductCard";
import { Filter, Loader2 } from "lucide-react";
import { useCategory } from "@/hooks/useCategories";
import { useInfiniteProducts } from "@/hooks/useProducts";
import { getImageUrl } from "@/lib/utils";
import { useState, useRef, useCallback } from "react";
import Image from "next/image";

const CategoryDetailContent = () => {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();

  // Fetch category by slug
  const { data: category, isLoading: isLoadingCategory } = useCategory(slug || "");

  // State for sorting - now using combined sort values
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [sortValue, setSortValue] = useState<string>("display_order_asc"); // Empty for default/bestseller

  // Fetch products by category ID with infinite scroll
  const {
    data,
    isLoading: isLoadingProducts,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteProducts({
    categoryIds: category ? [category.id] : undefined,
    sort: sortValue || undefined,
    limit: 12,
    enabled: !!category,
  });

  const categoryProducts = data?.pages.flatMap((page) => (page as any).data || []) || [];

  // Intersection Observer for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoadingProducts || isFetchingNextPage) return;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoadingProducts, isFetchingNextPage, hasNextPage, fetchNextPage],
  );

  const handleSortChange = (type: string) => {
    if (type === "price_low") {
      setSortValue("price_asc");
    } else if (type === "price_high") {
      setSortValue("price_desc");
    } else if (type === "bestseller") {
      setSortValue("best_selling");
    } else {
      setSortValue("display_order_asc");
    }
    setActiveFilter(type);
  };

  if (isLoadingCategory) {
    return (
      <PageLayout headerProps={{ title: "Đang tải...", showBack: true, showSearch: false }}>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  if (!category) {
    return (
      <PageLayout headerProps={{ title: "Không tìm thấy", showBack: true, showSearch: false }}>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Danh mục không tồn tại</p>
        </div>
      </PageLayout>
    );
  }

  // Get total count from first page meta if available
  const totalProducts = (data?.pages[0] as any)?.meta?.total || categoryProducts.length;

  return (
    <PageLayout headerProps={{ title: category.name, showBack: true, showSearch: false }}>
      <div className="space-y-4">
        {/* Category Header */}
        <div className="bg-card p-4 flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-card flex-shrink-0">
            <Image
              src={getImageUrl(category.image) || "https://placehold.co/100?text=No+Image"}
              alt={category.name}
              fill
              priority
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold">{category.name}</h2>
            <p className="text-muted-foreground">{totalProducts.toLocaleString()} sản phẩm</p>
          </div>
        </div>

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
            Đề xuất
          </button>
          <button
            onClick={() => handleSortChange("bestseller")}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${activeFilter === "bestseller" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
          >
            Bán chạy
          </button>
          <button
            onClick={() => handleSortChange("price_low")}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${activeFilter === "price_low" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
          >
            Giá thấp
          </button>
          <button
            onClick={() => handleSortChange("price_high")}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${activeFilter === "price_high" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
          >
            Giá cao
          </button>
        </div>

        {/* Products Grid */}
        <div className="pb-4">
          {isLoadingProducts && categoryProducts.length === 0 ? (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin w-8 h-8 text-primary" />
            </div>
          ) : categoryProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-2 px-2">
                {categoryProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Load More Trigger */}
              <div ref={loadMoreRef} className="flex justify-center py-4">
                {isFetchingNextPage && <Loader2 className="animate-spin w-6 h-6 text-primary" />}
                {!hasNextPage && categoryProducts.length > 0 && (
                  <p className="text-sm text-muted-foreground">Đã hiển thị tất cả sản phẩm</p>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Chưa có sản phẩm</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default CategoryDetailContent;
