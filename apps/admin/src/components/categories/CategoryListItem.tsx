import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Category } from "@/types/category";
import { getImageUrl } from "@/lib/utils";

interface CategoryListItemProps {
  category: Category;
}

const CategoryListItem = ({ category }: CategoryListItemProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/category/${category.slug}`)}
      className="w-full flex items-center gap-4 px-4 py-3 bg-background hover:bg-secondary/30 active:bg-secondary/50 transition-colors border-b border-border"
    >
      {/* Category Image */}
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-card flex-shrink-0">
        <img
          src={getImageUrl(category.image || "")}
          alt={category.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Category Info */}
      <div className="flex-1 text-left">
        <h3 className="font-medium text-foreground">{category.name}</h3>
      </div>

      {/* Product Count & Arrow */}
      <div className="flex items-center gap-2 text-muted-foreground">
        {/* <span className="text-sm">{category.productCount}</span> */}
        <ChevronRight className="w-5 h-5" />
      </div>
    </button>
  );
};

export default CategoryListItem;
