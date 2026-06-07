import { Zap } from "lucide-react";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";

interface ProductPriceSectionProps {
  product: Product;
  timeLeft: string;
}

export default function ProductPriceSection({ product, timeLeft }: ProductPriceSectionProps) {
  const hasDiscount = !!(product.salePrice && product.salePrice < product.price);
  const discountPercent = hasDiscount
    ? Math.round((1 - product.salePrice! / product.price) * 100)
    : 0;

  return (
    <div className="bg-gradient-to-r from-[#FFF5F5] to-[#FFF0F5] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {hasDiscount && (
            <span className="bg-primary text-white text-xs px-1.5 py-0.5 rounded font-medium">
              -{discountPercent}%
            </span>
          )}
          <span className="text-primary font-bold text-2xl">
            {formatPrice(product.salePrice ?? product.price)}
          </span>
        </div>
        <div className="flex items-center gap-1 text-primary">
          <Zap className="w-5 h-5 fill-primary" />
          <span className="font-bold text-sm">Flash Sale</span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-1">
        {hasDiscount && (
          <span className="text-muted-foreground text-sm line-through">
            {formatPrice(product.price)}
          </span>
        )}
        <span className="text-primary text-sm font-medium">Kết thúc sau {timeLeft}</span>
      </div>
    </div>
  );
}
