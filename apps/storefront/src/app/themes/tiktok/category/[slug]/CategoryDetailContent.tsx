"use client";

import { useParams, useRouter } from "next/navigation";
import PageLayout from "@/components/tiktok/layout/PageLayout";
import ProductCard from "@/components/tiktok/products/ProductCard";
import { Filter, ChevronDown, Loader2 } from "lucide-react";
import { useCategory } from "@/hooks/useCategories";
import { useInfiniteProducts } from "@/hooks/useProducts";
import { getImageUrl } from "@/lib/utils";
import { useState, useRef, useCallback } from "react";
import Image from "next/image";

// MuaBanTaiKhoan Theme Imports
import DeviceLayoutWrapper from "@/components/muabantaikhoan/layout/DeviceLayoutWrapper";
import MuabanCategoryDetail from "@/components/muabantaikhoan/features/category/CategoryDetail";

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
  const isLoading = isLoadingCategory || isLoadingProducts;

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

  const currentTheme = process.env.NEXT_PUBLIC_THEME || 'tiktok';

  if (currentTheme === 'muabantaikhoan') {
    if (isLoadingCategory) {
      return (
        <DeviceLayoutWrapper>
          <div className="bg-gray-50 min-h-screen py-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        </DeviceLayoutWrapper>
      );
    }

    const displayCategory = category || {
      id: "dummy",
      name: "Tài khoản, phần mềm mẫu",
      description: "Đang hiển thị dữ liệu giả lập vì danh mục này chưa có trong Database.",
      image: null,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapProductToCard = (product: any) => ({
      id: String(product.id),
      name: product.name,
      slug: product.slug,
      thumbnail: getImageUrl(product.images?.[0]?.url) || "",
      original_price: product.price,
      price: product.salePrice || product.price,
      discount_percent: product.discount_percent || (product.salePrice && product.price ? Math.round(((product.price - product.salePrice) / product.price) * 100) : undefined),
      tags: product.tags?.map((t: any) => t.name) || [],
      sold_count: product.sold_count || Math.floor(Math.random() * 100) + 10,
    });

    const dummyProducts = [
      { id: "s1", name: "Nâng Cấp Tinder Gold, Platinum Chính Chủ Giá Rẻ", slug: "tinder", thumbnail: "https://muataikhoanonline.com/wp-content/uploads/2024/06/tinder-247x247.png", original_price: undefined, price: 50000, discount_percent: undefined, tags: ["Pro Plus", "BH 12 tháng"], sold_count: 15 },
      { id: "s2", name: "Tài Khoản VSCOX Pro", slug: "vsco", thumbnail: "https://muataikhoanonline.com/wp-content/uploads/2024/06/Beauty-Plus-Premium-630x331-1-247x130.webp", original_price: 100000, price: 70000, discount_percent: 30, tags: [], sold_count: 22 },
      { id: "s3", name: "BeautyPlus Premium", slug: "beautyplus", thumbnail: "https://muataikhoanonline.com/wp-content/uploads/2024/06/istamp-630x331-1-247x130.webp", original_price: 100000, price: 70000, discount_percent: 30, tags: [], sold_count: 45 },
      { id: "s4", name: "App iStamp Chèn Chữ Lên Nhiều Ảnh", slug: "istamp", thumbnail: "https://muataikhoanonline.com/wp-content/uploads/2024/06/Xingtu-Vip-630x331-1-247x130.webp", original_price: 100000, price: 70000, discount_percent: 30, tags: [], sold_count: 12 },
      { id: "s5", name: "Xingtu VIP", slug: "xingtu", thumbnail: "https://muataikhoanonline.com/wp-content/uploads/2024/06/Meitu-Vip-630x331-1-247x130.webp", original_price: 100000, price: 70000, discount_percent: 30, tags: [], sold_count: 8 },
      { id: "s6", name: "Meitu VIP", slug: "meitu", thumbnail: "https://muataikhoanonline.com/wp-content/uploads/2024/06/Canva-Pro-Vinh-Vien-630x331-1-247x130.webp", original_price: 100000, price: 70000, discount_percent: 30, tags: [], sold_count: 34 },
      { id: "s7", name: "Tài Khoản Canva Pro Vĩnh Viễn", slug: "canva", thumbnail: "https://muataikhoanonline.com/wp-content/uploads/2024/06/Remini-Pro-630x331-1-247x130.webp", original_price: 100000, price: 70000, discount_percent: 30, tags: [], sold_count: 56 },
      { id: "s8", name: "Remini Pro", slug: "remini", thumbnail: "https://muataikhoanonline.com/wp-content/uploads/2024/06/Photoroom-630x331-1-247x130.webp", original_price: 100000, price: 70000, discount_percent: 30, tags: [], sold_count: 29 },
    ];

    const displayProducts = category && categoryProducts.length > 0 ? categoryProducts.map(mapProductToCard) : dummyProducts;
    const totalProducts = category && categoryProducts.length > 0 ? ((data?.pages[0] as any)?.meta?.total || categoryProducts.length) : dummyProducts.length;

    return (
      <DeviceLayoutWrapper>
        <MuabanCategoryDetail
          category={displayCategory}
          products={displayProducts}
          isLoading={isLoadingProducts && !!category}
          totalProducts={totalProducts}
        />
      </DeviceLayoutWrapper>
    );
  }

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
