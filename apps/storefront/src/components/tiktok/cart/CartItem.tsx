import { ChevronLeft, Minus, Plus, Trash2, Truck } from "lucide-react";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { CartItem as CartItemType } from "@/store/cartStore";

interface CartItemProps {
  item: CartItemType;
  isSelected: boolean;
  isEditMode: boolean;
  onToggle: () => void;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export default function CartItem({
  item,
  isSelected,
  isEditMode,
  onToggle,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  const image = item.images && item.images.length > 0 ? getImageUrl(item.images[0].url) : "";

  return (
    <div className="p-3 flex gap-3 relative bg-card/50">
      <div className="flex items-center">
        <input
          type="checkbox"
          className="w-4 h-4 accent-primary rounded-full cursor-pointer"
          checked={isSelected}
          onChange={onToggle}
        />
      </div>

      <div className="w-24 h-24 flex-shrink-0 bg-white/5 rounded-md overflow-hidden border border-white/10 relative">
        <img loading="lazy" src={image} alt={item.name} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="text-sm font-medium line-clamp-2 leading-snug mb-1 text-foreground/90">
            {item.name}
          </h3>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs bg-white/5 text-muted-foreground px-1.5 py-0.5 rounded border border-white/10 flex items-center gap-1">
              Mặc định <ChevronLeft className="w-3 h-3 -rotate-90" />
            </span>
            <span className="inline-flex items-center gap-0.5 text-tiktok-cyan text-[10px] border border-tiktok-cyan/30 bg-tiktok-cyan/5 rounded px-1 py-0.5">
              <Truck className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>

        <div className="flex items-end justify-between mt-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-primary font-bold text-base">
                {formatPrice(item.salePrice || item.price)}
              </span>
            </div>
            {item.salePrice && (
              <span className="text-muted-foreground text-xs line-through">
                {formatPrice(item.price)}
              </span>
            )}
          </div>

          <div className="flex items-center border border-white/10 rounded-sm h-6 bg-white/5">
            <button
              onClick={() => onUpdateQuantity(item.quantity - 1)}
              className="w-6 h-full flex items-center justify-center hover:bg-white/10 disabled:opacity-50 text-foreground"
              disabled={item.quantity <= 1}
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center text-sm font-medium border-x border-white/10">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              className="w-6 h-full flex items-center justify-center hover:bg-white/10 text-foreground"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Button */}
      <button
        onClick={onRemove}
        className={cn(
          "absolute top-0 right-0 p-2 text-muted-foreground opacity-0 transition-opacity bg-black/80 backdrop-blur-sm rounded-bl-lg",
          isEditMode && "opacity-100 text-destructive",
        )}
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
}
