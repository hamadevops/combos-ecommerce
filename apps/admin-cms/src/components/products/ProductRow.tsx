import { ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Product } from "@/types/product";

interface ProductRowProps {
  title?: string;
  products: Product[];
  viewAllLink?: string;
  layout?: "grid" | "row";
  onViewAll?: () => void;
}

const ProductRow = ({
  title,
  products,
  viewAllLink, // unused for now, can be used for navigation
  layout = "grid",
  onViewAll,
}: ProductRowProps) => {
  const isSlide = layout === "row" && products.length > 3;

  return (
    <section className="space-y-3">
      {title && (
        <div className="flex items-center justify-between px-4">
          <h2 className="font-bold text-lg">{title}</h2>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-sm text-muted-foreground flex items-center gap-1"
            >
              Xem thêm
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {isSlide ? (
        <Carousel
          opts={{
            align: "start",
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 px-4">
            {products.map((product) => (
              <CarouselItem key={product.id} className="pl-2 basis-1/3 min-w-[130px] h-full">
                {/* basis-1/3 roughly matches user request for 2-3 items visible */}
                <ProductCard product={product} compact />
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* Hidden controls on mobile usually, keeping simple for now */}
        </Carousel>
      ) : (
        <div className={`grid grid-cols-2 gap-2 px-2`}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductRow;
