import { Bookmark, Star } from "lucide-react";
import { Product } from "@/types/product";
import { cn } from "@/lib/utils";

interface ProductInfoSectionProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export default function ProductInfoSection({
  product,
  isFavorite,
  onToggleFavorite,
}: ProductInfoSectionProps) {
  const rating = (product as any).rating || "5.0";
  const reviewCount = (product as any).reviewCount || 0;

  return (
    <div className="px-4 py-3 border-b border-border">
      <div className="flex items-start gap-2">
        <span className="bg-[#00B8D4] text-white text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 mt-0.5">
          Mall
        </span>
        <h1 className="text-base font-medium leading-snug flex-1">{product.name}</h1>
        <button onClick={onToggleFavorite} className="flex-shrink-0">
          <Bookmark
            className={cn(
              "w-5 h-5",
              isFavorite ? "fill-primary text-primary" : "text-muted-foreground",
            )}
          />
        </button>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <Star className="w-4 h-4 fill-star text-star" />
        <span className="font-medium">{rating}</span>
        <span className="text-primary text-sm">({reviewCount} đánh giá)</span>
      </div>
    </div>
  );
}
