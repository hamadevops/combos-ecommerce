import { Loader2, ChevronDown, List, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import ProductListItem from "@/components/products/ProductListItem";
import ProductCard from "@/components/products/ProductCard";
import { useState, useRef, useCallback } from "react";
import { useInfiniteProducts } from "@/hooks/useProducts";

const productFilters = ["Đề xuất", "Bán chạy", "Hàng mới", "Giá"];

export default function ProductsTabContent() {
  const [activeFilter, setActiveFilter] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [priceSort, setPriceSort] = useState<"asc" | "desc">("asc");

  // Map filter index to sort value
  const getSortValue = () => {
    switch (activeFilter) {
      case 1: // Bán chạy
        return undefined; // Default backend sorting
      case 2: // Hàng mới
        return "newest";
      case 3: // Giá
        return priceSort === "asc" ? "price_asc" : "price_desc";
      default: // Đề xuất (index 0)
        return undefined;
    }
  };

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteProducts({
    sort: getSortValue(),
    limit: 12,
  });

  const products = data?.pages.flatMap((page) => page.items) || [];

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

  const handleFilterClick = (index: number) => {
    if (index === 3) {
      // Toggle price sort direction
      if (activeFilter === 3) {
        setPriceSort(priceSort === "asc" ? "desc" : "asc");
      } else {
        setActiveFilter(3);
      }
    } else {
      setActiveFilter(index);
    }
  };

  return (
    <div className="bg-background">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        {productFilters.map((filter, index) => (
          <button
            key={filter}
            onClick={() => handleFilterClick(index)}
            className={cn(
              "text-sm whitespace-nowrap flex items-center gap-1",
              activeFilter === index ? "text-foreground font-medium" : "text-muted-foreground",
            )}
          >
            {filter}
            {filter === "Giá" && (
              <ChevronDown
                className={cn(
                  "w-3 h-3 transition-transform",
                  activeFilter === 3 && priceSort === "desc" && "rotate-180",
                )}
              />
            )}
          </button>
        ))}
        <div className="ml-auto">
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="p-1"
          >
            {viewMode === "grid" ? (
              <List className="w-5 h-5 text-muted-foreground" />
            ) : (
              <LayoutGrid className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      <div className="py-2">
        {isLoading && products.length === 0 ? (
          <div className="flex justify-center p-8">
            <Loader2 className="animate-spin w-8 h-8 text-primary" />
          </div>
        ) : (
          <>
            {viewMode === "list" ? (
              <div className="space-y-3 px-4">
                {products.map((product) => (
                  <ProductListItem key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 px-2">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Load More Trigger */}
            <div ref={loadMoreRef} className="flex justify-center py-4">
              {isFetchingNextPage && <Loader2 className="animate-spin w-6 h-6 text-primary" />}
              {!hasNextPage && products.length > 0 && (
                <p className="text-sm text-muted-foreground">Đã hiển thị tất cả sản phẩm</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
