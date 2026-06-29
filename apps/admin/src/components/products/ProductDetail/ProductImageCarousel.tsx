import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProductImageCarouselProps {
  images: string[];
  productName: string;
}

export default function ProductImageCarousel({ images, productName }: ProductImageCarouselProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  return (
    <div className="relative bg-card">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${activeImageIndex * 100}%)` }}
        >
          {images.map((img, index) => (
            <div key={index} className="w-full flex-shrink-0 aspect-square">
              <img
                src={img}
                alt={`${productName} - ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Thumbnail preview - only if multiple images */}
      {images.length > 1 && (
        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded max-w-[80%] overflow-x-auto scrollbar-hide">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveImageIndex(index)}
              className={cn(
                "w-8 h-8 rounded overflow-hidden border flex-shrink-0",
                activeImageIndex === index ? "border-white" : "border-transparent opacity-70",
              )}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
          <span className="text-white text-xs ml-1 whitespace-nowrap">
            {activeImageIndex + 1}/{images.length}
          </span>
        </div>
      )}
    </div>
  );
}
