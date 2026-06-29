import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, ShieldCheck } from "lucide-react";
import { Product } from "@/types/product";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import CheckoutForm from "@/components/cart/CheckoutForm";

interface ProductListItemProps {
  product: Product;
}

const ProductListItem = ({ product }: ProductListItemProps) => {
  const navigate = useNavigate();
  const { addItem, setSelection, getSelectedPrice } = useCartStore();
  const [showCheckout, setShowCheckout] = useState(false);

  // Price Logic
  const currentPrice = product.salePrice ?? product.price;
  const originalPrice = product.salePrice ? product.price : null;

  const discountPercent = originalPrice ? Math.round((1 - currentPrice / originalPrice) * 100) : 0;

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
    setSelection([product.id]);
    setShowCheckout(true);
  };

  const mainImage =
    product.images && product.images.length > 0
      ? getImageUrl(product.images[0].url)
      : "https://placehold.co/120";

  return (
    <>
      <div
        className="flex gap-3 bg-background cursor-pointer active:bg-secondary/30 transition-colors py-3 border-b border-border last:border-b-0"
        onClick={() => navigate(`/product/${product.slug}`, { state: { fromApp: true } })}
      >
        {/* Product Image */}
        <div className="relative w-[120px] h-[120px] flex-shrink-0 rounded-lg overflow-hidden bg-card border border-border/50">
          <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
        </div>

        {/* Product Info */}
        <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
          <div className="space-y-1">
            {/* Title */}
            <h3 className="font-medium text-sm line-clamp-2 leading-tight text-foreground/90 h-10">
              {product.name}
            </h3>

            {/* Shipping/Sale badges - clustered */}
            <div className="flex flex-wrap gap-1.5 h-5 overflow-hidden">
              <span className="inline-flex items-center gap-0.5 text-tiktok-cyan text-[10px] border border-tiktok-cyan/30 bg-tiktok-cyan/10 rounded px-1 py-px font-medium">
                <ShieldCheck className="w-2.5 h-2.5" />
                Chính hãng
              </span>
              {discountPercent > 0 && (
                <span className="text-primary text-[10px] bg-primary/10 px-1 py-px rounded font-medium">
                  -{discountPercent}%
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "w-2.5 h-2.5",
                      star <= Math.floor(product.rating || 5)
                        ? "fill-star text-star"
                        : "text-muted-foreground/30",
                    )}
                  />
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground pt-0.5">
                {/* Sold count missing in type */}
                {/* {formatSoldCount(product.soldCount)} đã bán */}
                {product.reviewCount || 0} đ.giá
              </span>
            </div>
          </div>

          {/* Price Row */}
          <div className="flex items-end justify-between mt-1 gap-2">
            <div className="flex flex-col">
              <span className="text-primary font-bold text-base leading-none">
                {formatPrice(currentPrice)}
              </span>
              {originalPrice && (
                <span className="text-muted-foreground text-[10px] line-through mt-0.5">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
            <button
              className="bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white text-xs px-3 py-1.5 rounded-md font-bold shadow-sm active:scale-95 transition-all flex items-center"
              onClick={handleBuyNow}
            >
              Mua ngay
            </button>
          </div>
        </div>
      </div>

      <CheckoutForm
        open={showCheckout}
        onOpenChange={setShowCheckout}
        totalAmount={getSelectedPrice()}
      />
    </>
  );
};

export default ProductListItem;
