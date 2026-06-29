"use client";

import { useState, useEffect } from "react";
import { Product, ProductVariant } from "@/types/product";
import { getImageUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ProductVariantsSectionProps {
  product: Product;
  selectedVariant: ProductVariant | null;
  onChange: (variant: ProductVariant | null) => void;
}

export default function ProductVariantsSection({
  product,
  selectedVariant,
  onChange,
}: ProductVariantsSectionProps) {
  const tierVariations = (product as any).tierVariations || [];
  const variants = product.variants || [];

  // Local state for selected option values (key is tier name, value is selected option value)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Initialize selected options if not set
  useEffect(() => {
    if (tierVariations.length > 0 && Object.keys(selectedOptions).length === 0) {
      const initial: Record<string, string> = {};
      // Auto-select first option of each tier if desired, or leave empty
      // For better UX, we leave it empty so they must choose
      setSelectedOptions(initial);
    }
  }, [tierVariations]);

  if (tierVariations.length === 0 || variants.length === 0) {
    return null;
  }

  const handleSelectOption = (tierName: string, optionValue: string) => {
    const updated = {
      ...selectedOptions,
      [tierName]: optionValue,
    };
    setSelectedOptions(updated);

    // Check if all tiers have a selection
    const allSelected = tierVariations.every((tier: any) => updated[tier.name]);

    if (allSelected) {
      // Find matching variant based on the order of tierVariations
      const selectedList = tierVariations.map((tier: any) => updated[tier.name]);
      const matched = variants.find(
        (v) =>
          v.optionValues &&
          v.optionValues.length === selectedList.length &&
          v.optionValues.every((val, idx) => val === selectedList[idx]),
      );
      onChange(matched || null);
    } else {
      onChange(null);
    }
  };

  // Check if an option is active/available based on current other selections (regardless of stock)
  const isOptionSelectable = (tierName: string, optionValue: string) => {
    // If there is only one tier variation, option is selectable if there is any variant matching it that is active
    if (tierVariations.length === 1) {
      const matched = variants.find((v) => v.optionValues?.[0] === optionValue);
      return matched ? matched.isActive !== 0 : false;
    }

    // If there are multiple tiers, check if there is at least one active variant
    // that matches this option and the currently selected options for OTHER tiers.
    const otherTiersSelected = { ...selectedOptions };
    delete otherTiersSelected[tierName];

    return variants.some((v) => {
      if (!v.optionValues || v.isActive === 0) return false;

      // Check if variant matches this option's value
      const tierIndex = tierVariations.findIndex((t: any) => t.name === tierName);
      if (v.optionValues[tierIndex] !== optionValue) return false;

      // Check if variant matches all other selected option values
      return Object.entries(otherTiersSelected).every(([otherTierName, otherVal]) => {
        const otherIdx = tierVariations.findIndex((t: any) => t.name === otherTierName);
        return v.optionValues?.[otherIdx] === otherVal;
      });
    });
  };

  // Check if an option is currently in stock based on selections for other tiers
  const isOptionInStock = (tierName: string, optionValue: string) => {
    if (tierVariations.length === 1) {
      const matched = variants.find((v) => v.optionValues?.[0] === optionValue);
      return matched ? (matched.stock ?? 0) > 0 : false;
    }

    const otherTiersSelected = { ...selectedOptions };
    delete otherTiersSelected[tierName];

    return variants.some((v) => {
      if (!v.optionValues || (v.stock ?? 0) <= 0 || v.isActive === 0) return false;

      const tierIndex = tierVariations.findIndex((t: any) => t.name === tierName);
      if (v.optionValues[tierIndex] !== optionValue) return false;

      return Object.entries(otherTiersSelected).every(([otherTierName, otherVal]) => {
        const otherIdx = tierVariations.findIndex((t: any) => t.name === otherTierName);
        return v.optionValues?.[otherIdx] === otherVal;
      });
    });
  };

  return (
    <div className="px-4 py-4 border-b border-border bg-card space-y-4">
      <h3 className="text-[14px] font-bold text-foreground">Phân loại hàng</h3>
      
      <div className="space-y-4">
        {tierVariations.map((tier: any, tierIdx: number) => {
          const selectedValue = selectedOptions[tier.name];

          return (
            <div key={tier.id || tier.name} className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="uppercase tracking-wider font-semibold">{tier.name}</span>
                {selectedValue && (
                  <span className="text-primary font-medium">Đã chọn: {selectedValue}</span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {tier.options?.map((option: any) => {
                  const isSelected = selectedValue === option.value;
                  const isSelectable = isOptionSelectable(tier.name, option.value);
                  const isInStock = isOptionInStock(tier.name, option.value);
                  const hasImage = tierIdx === 0 && option.imageUrl; // Option image only for tier 1

                  return (
                    <button
                      key={option.id || option.value}
                      type="button"
                      disabled={!isSelectable}
                      onClick={() => handleSelectOption(tier.name, option.value)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all active:scale-[0.98]",
                        isSelected
                          ? "border-primary bg-primary/5 text-primary shadow-sm"
                          : "border-border bg-card text-foreground hover:bg-muted",
                        !isSelectable && "opacity-40 cursor-not-allowed bg-muted border-border/50 text-muted-foreground",
                        isSelectable && !isInStock && "opacity-60 border-dashed text-muted-foreground bg-muted/30",
                      )}
                    >
                      {hasImage && (
                        <div className="w-5 h-5 rounded overflow-hidden bg-muted relative shrink-0">
                          <img
                            src={getImageUrl(option.imageUrl)}
                            alt={option.value}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <span>{option.value}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
