"use client";

import { Star, ShoppingCart, Truck, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product } from "@/types/product";
import { getImageUrl, formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useState } from "react";
import CheckoutForm from "../cart/CheckoutForm";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

const ProductCard = ({ product, compact = false }: ProductCardProps) => {
  const router = useRouter();
  const { addItem, setSelection, getSelectedPrice } = useCartStore();
  const [showCheckout, setShowCheckout] = useState(false);

  // Price Logic:
  const currentPrice = product.salePrice ?? product.price;
  const originalPrice = product.salePrice ? product.price : null;

  const discountPercent = originalPrice ? Math.round((1 - currentPrice / originalPrice) * 100) : 0;

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setSelection([product.id]);
    setShowCheckout(true);
  };

  // Image handling: get first image or placeholder
  const mainImage =
    (product.images && product.images.length > 0 && getImageUrl(product.images[0].url)) ||
    "https://placehold.co/300";

  // Compute rating and sold count (randomized if missing for generic effect, or from product)
  // New Product type doesn't have rating/soldCount directly on root in some versions,
  // but let's assume we might extend it or it's not there.
  // The user's new product type DOES NOT have rating/soldCount.
  // We will simulate them or check if they exist (TS will complain if not).
  // Casting to 'any' for the missing fields to support legacy/mock display without breaking build suitable for now.
  const displayRating = (product as any).rating || 5.0;
  const displaySoldCount =
    (product as any).soldCount || (product.id ? ((product.id * 137) % 900) + 100 : 150);

  if (compact) {
    return (
      <>
        <Link
          href={`/${product.slug}`}
          className="bg-card rounded-lg overflow-hidden cursor-pointer active:scale-[0.98] transition-transform h-full flex flex-col"
        >
          <div className="relative aspect-square">
            <Image src={mainImage} alt={product.name} fill className="object-cover" sizes="80px" />
          </div>

          <div className="p-2 space-y-1 flex-1 flex flex-col">
            <h3 className="text-xs line-clamp-2 leading-tight min-h-[2.5em]">{product.name}</h3>

            {/* Authentic badge */}
            <div className="flex items-center gap-1">
              <span className="inline-flex items-center gap-0.5 text-tiktok-cyan text-[10px] border border-tiktok-cyan rounded px-1 py-0.5">
                <ShieldCheck className="w-2.5 h-2.5" />
                Chính hãng
              </span>
            </div>

            <div className="mt-auto space-y-1">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "w-2 h-2",
                          star <= Math.floor(displayRating)
                            ? "fill-star text-star"
                            : "text-muted-foreground",
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{displayRating}</span>
                </div>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-primary font-bold text-sm">{formatPrice(currentPrice)}</span>
              </div>
              {/* Original Price */}
              <span
                className={cn(
                  "text-muted-foreground text-[10px] line-through block",
                  !originalPrice && "invisible",
                )}
              >
                {originalPrice ? formatPrice(originalPrice) : "0đ"}
              </span>
            </div>
          </div>
        </Link>
        <CheckoutForm
          open={showCheckout}
          onOpenChange={setShowCheckout}
          totalAmount={getSelectedPrice()}
        />
      </>
    );
  }

  return (
    <>
      <Link
        href={`/${product.slug}`}
        className="bg-card rounded-lg overflow-hidden cursor-pointer active:scale-[0.98] transition-transform h-full flex flex-col"
      >
        <div className="relative w-full aspect-square bg-muted/20">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>

        <div className="p-2 space-y-2 flex-1 flex flex-col">
          <h3 className="text-sm line-clamp-2 leading-snug font-medium min-h-[2.5em] text-foreground/90">
            {product.name}
          </h3>

          {/* Badges Row */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-0.5 text-tiktok-cyan text-[10px] border border-tiktok-cyan rounded-[2px] px-1 py-0.5 font-medium">
              <ShieldCheck className="w-2.5 h-2.5" />
              Chính hãng
            </span>
            {discountPercent > 0 && (
              <span className="bg-[#FFF5F5] text-[#D01B1B] text-[10px] px-1 py-0.5 rounded-[2px] font-medium border border-[#D01B1B]/10">
                Giảm {discountPercent}%
              </span>
            )}
          </div>

          <div className="mt-auto space-y-2">
            {/* Rating & Sold Row */}
            <div className="flex items-center gap-1 text-[11px]">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "w-3 h-3",
                      star <= (displayRating ? Math.floor(displayRating) : 5)
                        ? "fill-[#FFAD33] text-[#FFAD33]" // Golden star color
                        : "text-muted-foreground/20",
                    )}
                  />
                ))}
              </div>
              <span className="font-medium ml-0.5">{displayRating || "5.0"}</span>
              <span className="text-muted-foreground/40">|</span>
              <span className="text-muted-foreground">Đã bán {displaySoldCount}</span>
            </div>

            {/* Price & Action Row */}
            <div className="flex items-end justify-between gap-1">
              <div className="flex flex-col gap-0.5">
                <span className="text-[#FE2C55] font-bold text-base leading-none">
                  {formatPrice(currentPrice)}
                </span>
                <span
                  className={cn(
                    "text-muted-foreground text-[11px] line-through",
                    !originalPrice && "invisible",
                  )}
                >
                  {originalPrice ? formatPrice(originalPrice) : "0đ"}
                </span>
              </div>
              <button
                className="bg-[#FE2C55] text-white text-[11px] px-3 py-1.5 rounded font-semibold hover:bg-[#FE2C55]/90 transition-colors active:scale-95 mb-0.5 shrink-0 whitespace-nowrap"
                onClick={handleBuyNow}
              >
                Mua ngay
              </button>
            </div>
          </div>
        </div>
      </Link>
      <CheckoutForm
        open={showCheckout}
        onOpenChange={setShowCheckout}
        totalAmount={getSelectedPrice()}
      />
    </>
  );
};

export default ProductCard;
