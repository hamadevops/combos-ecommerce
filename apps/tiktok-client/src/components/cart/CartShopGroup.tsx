import { ChevronRight } from "lucide-react";
import { CartItem as CartItemType } from "@/store/cartStore";
import CartItem from "./CartItem";

interface CartShopGroupProps {
  shopName: string;
  items: CartItemType[];
  selectedItemIds: number[];
  isEditMode: boolean;
  onToggleItem: (id: number) => void;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
  onToggleShop: (checked: boolean) => void;
}

export default function CartShopGroup({
  shopName,
  items,
  selectedItemIds,
  isEditMode,
  onToggleItem,
  onUpdateQuantity,
  onRemoveItem,
  onToggleShop,
}: CartShopGroupProps) {
  const allSelected = items.length > 0 && items.every((item) => selectedItemIds.includes(item.id));

  return (
    <div className="bg-card rounded-xl overflow-hidden border border-white/5">
      {/* Shop Header */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-white/5 bg-white/5">
        <input
          type="checkbox"
          className="w-4 h-4 accent-primary rounded-full cursor-pointer"
          checked={allSelected}
          onChange={(e) => onToggleShop(e.target.checked)}
        />
        <div className="flex items-center gap-1">
          <span className="bg-[#00B8D4] text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
            Mall
          </span>
          <span className="text-sm font-bold flex-1">{shopName}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* Items List */}
      <div className="divide-y divide-white/5">
        {items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            isSelected={selectedItemIds.includes(item.id)}
            isEditMode={isEditMode}
            onToggle={() => onToggleItem(item.id)}
            onUpdateQuantity={(q) => onUpdateQuantity(item.id, q)}
            onRemove={() => onRemoveItem(item.id)}
          />
        ))}
      </div>
    </div>
  );
}
