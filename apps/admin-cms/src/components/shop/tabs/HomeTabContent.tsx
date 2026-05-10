import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BannerCarousel from "@/components/shop/BannerCarousel";
import ProductRow from "@/components/products/ProductRow";
import CategoryCard from "@/components/categories/CategoryCard";

interface HomeTabContentProps {
  isLoadingCats: boolean;
  isLoadingNew: boolean;
  isLoadingFeatured: boolean;
  isLoadingAll: boolean;
  categoryList: any[];
  newList: any[];
  featuredList: any[];
  productList: any[];
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
}: HomeTabContentProps) {
  const navigate = useNavigate();

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
          onViewAll={() => navigate("/products")}
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
          onViewAll={() => navigate("/products")}
        />
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 px-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <span className="text-primary font-medium">Đề xuất cho bạn</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>
        {isLoadingAll ? (
          <div className="flex justify-center p-4">
            <Loader2 className="animate-spin w-6 h-6 text-primary" />
          </div>
        ) : (
          <ProductRow products={productList} layout="grid" />
        )}
      </div>
    </div>
  );
}
