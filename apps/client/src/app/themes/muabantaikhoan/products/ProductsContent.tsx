"use client";

import DeviceLayoutWrapper from "@/components/muabantaikhoan/layout/DeviceLayoutWrapper";
import ProductCard from "@/components/muabantaikhoan/shared/cards/ProductCard";
import { useInfiniteProducts } from "@/hooks/useProducts";
import { Filter, ChevronDown, Loader2 } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { getImageUrl } from "@/lib/utils";

const ProductsContent = () => {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapProductToCard = (p: any) => ({
    id: String(p.id),
    name: p.name,
    slug: p.slug,
    thumbnail: getImageUrl(p.images?.[0]?.url) || "",
    originalPrice: p.price,
    currentPrice: p.salePrice || p.price,
    discountPercent: p.discount_percent || (p.salePrice && p.price ? Math.round(((p.price - p.salePrice) / p.price) * 100) : undefined),
    tags: p.tags?.map((t: any) => t.name) || [],
    soldCount: p.sold_count || 0,
  });

  const mappedProducts = products.map(mapProductToCard);

  return (
    <DeviceLayoutWrapper>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Title & Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {searchTerm ? `Kết quả tìm kiếm cho "${searchTerm}"` : "Tất cả sản phẩm"}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Tìm thấy {products.length} sản phẩm
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <button className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm whitespace-nowrap transition-colors">
                <Filter className="w-4 h-4" />
                Bộ lọc
              </button>

              <button
                onClick={() => handleSortChange("all")}
                className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${activeFilter === "all" ? "bg-red-600 text-white font-medium" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
              >
                Mặc định
              </button>
              <button
                onClick={() => handleSortChange("bestseller")}
                className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${activeFilter === "bestseller" ? "bg-red-600 text-white font-medium" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
              >
                Bán chạy
              </button>
              <button
                onClick={() => handleSortChange("newest")}
                className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${activeFilter === "newest" ? "bg-red-600 text-white font-medium" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
              >
                Mới nhất
              </button>
              <button
                onClick={() =>
                  handleSortChange(activeFilter === "price_asc" ? "price_desc" : "price_asc")
                }
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${["price_asc", "price_desc"].includes(activeFilter) ? "bg-red-600 text-white font-medium" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
              >
                Giá
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${activeFilter === "price_asc" ? "rotate-180" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Products Grid */}
          {isLoading && products.length === 0 ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin w-8 h-8 text-red-600" />
            </div>
          ) : mappedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mappedProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>

              {/* Load More Trigger */}
              <div ref={loadMoreRef} className="flex justify-center py-8">
                {isFetchingNextPage && <Loader2 className="animate-spin w-6 h-6 text-red-600" />}
                {!hasNextPage && products.length > 0 && (
                  <p className="text-sm text-gray-500">Đã hiển thị tất cả sản phẩm</p>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white text-center py-16 rounded-xl border border-gray-100 text-gray-500">
              Không tìm thấy sản phẩm nào
            </div>
          )}
        </div>
      </div>
    </DeviceLayoutWrapper>
  );
};

export default ProductsContent;
