"use client";

import { useState } from "react";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import ShopHeader from "@/components/shop/ShopHeader";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/useCategories";
import {
  useProducts,
  useFeaturedProducts,
  useNewArrivals,
  useInfiniteProducts,
} from "@/hooks/useProducts";
import HomeTabContent from "@/components/shop/tabs/HomeTabContent";
import dynamic from "next/dynamic";
const ProductsTabContent = dynamic(() => import("@/components/shop/tabs/ProductsTabContent"));
const CategoriesTabContent = dynamic(() => import("@/components/shop/tabs/CategoriesTabContent"));

const mainTabs = ["Trang chủ", "Sản phẩm", "Danh mục"];

const Index = () => {
  const [activeTab, setActiveTab] = useState(0);

  // Data Hooks
  const { data: categories, isLoading: isLoadingCats } = useCategories();
  const { data: featuredProducts, isLoading: isLoadingFeatured } = useFeaturedProducts();
  const { data: newArrivals, isLoading: isLoadingNew } = useNewArrivals();
  const {
    data: allProducts,
    isLoading: isLoadingAll,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteProducts({
    type: "recommended",
    limit: 12,
  });

  const categoryList = Array.isArray(categories) ? categories : categories?.data || [];
  const featuredList = featuredProducts?.data || [];
  const newList = newArrivals?.data || [];
  const productList =
    allProducts?.pages.flatMap((page) => (page as any).data || (page as any).items || []) || [];

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      {/* Shop Header */}
      <ShopHeader />

      {/* Main Tabs */}
      <div className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex">
          {mainTabs.map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(index)}
              className={cn(
                "flex-1 py-3 text-sm font-medium relative transition-colors",
                activeTab === index ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {tab}
              {activeTab === index && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-foreground rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 0 && (
        <HomeTabContent
          isLoadingCats={isLoadingCats}
          isLoadingNew={isLoadingNew}
          isLoadingFeatured={isLoadingFeatured}
          isLoadingAll={isLoadingAll}
          categoryList={categoryList}
          newList={newList}
          featuredList={featuredList}
          productList={productList}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
        />
      )}

      {activeTab === 1 && <ProductsTabContent />}

      {activeTab === 2 && (
        <CategoriesTabContent isLoading={isLoadingCats} categories={categoryList} />
      )}

      {/* Footer */}
      <Footer />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Index;
