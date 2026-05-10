"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Category } from "@/types/category";
import { getImageUrl } from "@/lib/utils";
import Image from "next/image";

interface CategoryCardProps {
  category: Category;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  const router = useRouter();

  return (
    <Link href={`/danh-muc/${category.slug}`} className="flex flex-col items-center gap-2">
      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-card border border-border">
        {/* Use category.image or fallback placeholder */}
        <Image
          src={getImageUrl(category.image) || "https://placehold.co/64"}
          alt={category.name}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>
      <h3 className="text-xs text-center line-clamp-2 leading-tight px-1 font-normal text-foreground">
        {category.name}
      </h3>
    </Link>
  );
};

export default CategoryCard;
