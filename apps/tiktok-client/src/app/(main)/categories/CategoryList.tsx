"use client";

import { useCategories } from "@/hooks/useCategories";
import { Loader2 } from "lucide-react";
import { Category } from "@/types/category";
import CategoryListItem from "@/components/categories/CategoryListItem";

const CategoryList = () => {
  const { data: categories, isLoading } = useCategories();

  const categoryList = Array.isArray(categories) ? categories : (categories as any)?.data || [];

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3 min-h-screen">
      {categoryList.map((category: Category) => (
        <div key={category.id} className="bg-card rounded-xl overflow-hidden mb-3">
          <CategoryListItem category={category} />
        </div>
      ))}
    </div>
  );
};

export default CategoryList;
