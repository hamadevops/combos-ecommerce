import { Loader2 } from "lucide-react";
import CategoryListItem from "@/components/tiktok/categories/CategoryListItem";

interface CategoriesTabContentProps {
  isLoading: boolean;
  categories: any[];
}

export default function CategoriesTabContent({ isLoading, categories }: CategoriesTabContentProps) {
  return (
    <div className="bg-background py-2">
      <div className="space-y-0">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="animate-spin w-8 h-8 text-primary" />
          </div>
        ) : (
          categories.map((category) => <CategoryListItem key={category.id} category={category} />)
        )}
      </div>
    </div>
  );
}
