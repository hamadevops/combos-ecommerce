"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import ProductRow from "@/components/products/ProductRow";
import { useCartStore } from "@/store/cartStore";
import { getImageUrl } from "@/lib/utils";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import CheckoutForm from "@/components/cart/CheckoutForm";

import {
  ProductHeader,
  ProductImageCarousel,
  ProductPriceSection,
  ProductInfoSection,
  ProductDeliveryInfo,
  ProductTabs,
  ProductOverview,
  ProductReviews,
  ProductDescription,
  ProductBottomBar,
  ProductCreatorVideos,
} from "@/components/products/ProductDetail";
import Footer from "@/components/layout/Footer";

const SECTION_IDS = ["overview", "reviews", "description", "recommendations"];

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

  // Fetch Recommendations
  const { data: recommendationsData } = useProducts({
    limit: 8,
  });

  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const { addItem, setSelection, getSelectedPrice } = useCartStore();

  // Random countdown
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    let seconds = Math.floor(Math.random() * (86400 - 10000) + 10000);

    const formatTime = (secs: number) => {
      const h = Math.floor(secs / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = secs % 60;
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    setTimeLeft(formatTime(seconds));

    const interval = setInterval(() => {
      seconds > 0 ? seconds-- : (seconds = 0);
      setTimeLeft(formatTime(seconds));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleBuyNow = () => {
    if (product) {
      if (!product.price) return;
      const existing = useCartStore.getState().items.find((i) => i.id === product.id);
      if (!existing) addItem(product);
      setSelection([product.id]);
      setShowCheckoutForm(true);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addItem(product);
      toast.success("Đã thêm vào giỏ hàng");
    }
  };

  // Scroll Sync Logic
  const handleTabClick = (index: number) => {
    const element = document.getElementById(SECTION_IDS[index]);
    if (element) {
      const offset = 95;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      setActiveTab(index);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Tab Sync on Scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      let currentIdx = 0;
      for (let i = SECTION_IDS.length - 1; i >= 0; i--) {
        const element = document.getElementById(SECTION_IDS[i]);
        if (element) {
          const offsetTop = element.getBoundingClientRect().top + window.scrollY;
          if (scrollPosition >= offsetTop) {
            currentIdx = i;
            break;
          }
        }
      }
      setActiveTab(currentIdx);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background max-w-md mx-auto flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-background max-w-md mx-auto flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Sản phẩm không tồn tại hoặc đã bị xóa</p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  const validImages = product.images
    ?.map((img) => getImageUrl(img.url))
    .filter((url): url is string => !!url);
  const productImages =
    validImages && validImages.length > 0 ? validImages : ["https://placehold.co/600"];

  const relatedProducts = (relatedData as any)?.data || [];
  const recommendationList = (recommendationsData as any)?.data || [];
  const tabs = ["Tổng quan", "Đánh giá", "Mô tả", "Đề xuất"];

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      <div className="pb-24" id="overview">
        <ProductHeader />

        <ProductTabs tabs={tabs} activeTab={activeTab} onTabClick={handleTabClick} />

        <ProductImageCarousel images={productImages} productName={product.name} />

        <ProductPriceSection product={product} timeLeft={timeLeft} />

        <ProductInfoSection
          product={product}
          isFavorite={isFavorite}
          onToggleFavorite={() => setIsFavorite(!isFavorite)}
        />

        <ProductDeliveryInfo />

        <div className="space-y-2 pb-4">
          <ProductOverview product={product} />
          <ProductCreatorVideos product={product} />
          <ProductReviews product={product} />
          <ProductDescription product={product} />

          <div
            id="recommendations"
            className="bg-background border-t border-border scroll-mt-[100px]"
          >
            {relatedProducts.length > 0 && (
              <ProductRow title="Sản phẩm tương tự" products={relatedProducts} layout="row" />
            )}

            <ProductRow title="Có thể bạn cũng thích" products={recommendationList} layout="grid" />
          </div>
        </div>
      </div>
      <Footer />

      <ProductBottomBar
        price={product.salePrice ? product.salePrice : product.price}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      <CheckoutForm
        open={showCheckoutForm}
        onOpenChange={setShowCheckoutForm}
        totalAmount={getSelectedPrice()}
      />
    </div>
  );
};

export default ProductDetailContent;
