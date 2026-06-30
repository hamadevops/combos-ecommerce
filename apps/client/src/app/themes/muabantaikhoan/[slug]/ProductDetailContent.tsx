"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useCartStore } from "@/store/cartStore";
import { getImageUrl } from "@/lib/utils";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ProductVariant } from "@/types/product";

import DeviceLayoutWrapper from "@/components/muabantaikhoan/layout/DeviceLayoutWrapper";
import MuabanProductDetail from "@/components/muabantaikhoan/features/product/ProductDetail";

const ProductDetailContent = () => {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();

  // Fetch Product Data
  const { data: productDetail, isLoading, isError } = useProduct(slug || "");
  const product = useMemo(() => productDetail, [productDetail]);
  // Fetch Related Products
  const { data: relatedData } = useProducts({
    type: "similar",
    similar_to: slug,
    limit: 6,
  });

  const { addItem, setSelection } = useCartStore();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  const handleBuyNow = (variant: ProductVariant | null = selectedVariant) => {
    if (product) {
      if (product.product_type === "affiliate" || product.productType === "affiliate") {
        if (product.affiliate_link) {
          window.open(product.affiliate_link, "_blank");
        } else {
          toast.error("Sản phẩm chưa có liên kết mua hàng");
        }
        return;
      }
      if (product.variants && product.variants.length > 0 && !variant) {
        toast.error("Vui lòng chọn phân loại hàng");
        return;
      }
      const targetPrice = variant ? (variant.salePrice || variant.price) : (product.salePrice || product.price);
      if (!targetPrice) return;

      const itemId = variant ? variant.id : product.id;
      const existing = useCartStore.getState().items.find((i) => i.id === itemId);
      if (!existing) addItem(product, 1, variant || undefined);
      setSelection([itemId]);
      router.push("/checkout");
    }
  };

  const handleAddToCart = (variant: ProductVariant | null = selectedVariant) => {
    if (product) {
      if (product.product_type === "affiliate" || product.productType === "affiliate") {
        toast.info("Sản phẩm liên kết, vui lòng nhấn Mua Ngay để mua hàng");
        return;
      }
      if (product.variants && product.variants.length > 0 && !variant) {
        toast.error("Vui lòng chọn phân loại hàng");
        return;
      }
      addItem(product, 1, variant || undefined);
      toast.success("Đã thêm vào giỏ hàng");
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) {
    return (
      <DeviceLayoutWrapper>
        <div className="bg-gray-50 min-h-screen py-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DeviceLayoutWrapper>
    );
  }

  if (isError || !product) {
    return (
      <DeviceLayoutWrapper>
        <div className="min-h-screen bg-gray-50 max-w-md mx-auto flex flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">Sản phẩm không tồn tại hoặc đã bị xóa</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-primary text-white rounded-md font-medium"
          >
            Về trang chủ
          </button>
        </div>
      </DeviceLayoutWrapper>
    );
  }

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
    soldCount: p.sold_count || Math.floor(Math.random() * 100) + 10,
  });

  const relatedProducts = (relatedData as any)?.data?.map(mapProductToCard) || [];

  return (
    <DeviceLayoutWrapper>
      <MuabanProductDetail 
        product={product}
        relatedProducts={relatedProducts}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />
    </DeviceLayoutWrapper>
  );
};

export default ProductDetailContent;
