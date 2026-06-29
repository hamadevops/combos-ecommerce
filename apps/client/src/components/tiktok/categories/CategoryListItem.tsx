"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Category } from "@/types/category";
import { getImageUrl } from "@/lib/utils";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CategoryListItemProps {
  category: Category;
  level?: number;
}

const CategoryListItem = ({ category, level = 0 }: CategoryListItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Stop Link navigation
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="w-full flex flex-col">
      <Link
        href={`/danh-muc/${category.slug}`}
        style={{ paddingLeft: `${Math.max(1, level * 1.5 + 1)}rem` }}
        className={cn(
          "w-full flex items-center gap-4 pr-4 py-3 hover:bg-secondary/30 active:bg-secondary/50 transition-colors border-b border-border",
          level === 0 ? "bg-background" : "bg-muted/20",
        )}
      >
        {/* Category Image */}
        <div
          className={cn(
            "rounded-lg overflow-hidden bg-card flex-shrink-0 border border-border",
            level === 0 ? "w-12 h-12" : "w-10 h-10",
          )}
        >
          <img
            src={getImageUrl(category.image || "") || "https://placehold.co/64"}
            alt={category.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://placehold.co/64";
            }}
          />
        </div>

        {/* Category Info */}
        <div className="flex-1 text-left">
          <h3 className={cn("text-foreground", level === 0 ? "font-medium" : "text-sm")}>
            {category.name}
          </h3>
        </div>

        {/* Arrow (Accordion Toggle) */}
        {hasChildren ? (
          <button
            onClick={handleToggle}
            className="p-2 -mr-2 bg-secondary/50 rounded-full active:scale-95 transition-transform"
            aria-label={isExpanded ? "Thu gọn danh mục" : "Mở rộng danh mục"}
          >
            <ChevronRight
              className={cn(
                "w-5 h-5 text-muted-foreground transition-transform",
                isExpanded && "rotate-90",
              )}
            />
          </button>
        ) : (
          <div className="p-2 -mr-2">
            <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
          </div>
        )}
      </Link>

      {/* Subcategories Accordion */}
      {hasChildren && (
        <div
          className={cn(
            "flex flex-col overflow-hidden transition-all duration-300 ease-in-out",
            isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          {category.children!.map((child) => (
            <CategoryListItem key={child.id} category={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryListItem;
