import { useNavigate } from "react-router-dom";
import { Category } from "@/types/category";
import { getImageUrl } from "@/lib/utils";

interface CategoryCardProps {
  category: Category;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/category/${category.slug}`)}
      className="flex flex-col items-center gap-2"
    >
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-card border border-border">
        {/* Use category.image or fallback placeholder */}
        <img
          src={getImageUrl(category.image || "")}
          alt={category.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Optional: Fallback if image fails
            (e.target as HTMLImageElement).src = "https://placehold.co/64";
          }}
        />
      </div>
      <span className="text-xs text-center line-clamp-2 leading-tight px-1">{category.name}</span>
    </button>
  );
};

export default CategoryCard;
