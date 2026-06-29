"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImageCarouselProps {
  images: string[];
  productName: string;
}

export default function ProductImageCarousel({ images, productName }: ProductImageCarouselProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fullscreenScrollRef = useRef<HTMLDivElement>(null);

  // Sync scroll position when scrolling naturally
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    if (width === 0) return;
    const index = Math.round(scrollLeft / width);
    setActiveImageIndex(index);
  };

  const scrollToImage = (index: number, isFullscreenTarget: boolean = false) => {
    setActiveImageIndex(index);
    const ref = isFullscreenTarget ? fullscreenScrollRef : scrollContainerRef;
    if (ref.current) {
      const width = ref.current.clientWidth;
      ref.current.scrollTo({
        left: width * index,
        behavior: "smooth",
      });
    }
  };

  // Prevent background scrolling when fullscreen is open
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
      // Ensure the fullscreen element scrolls to the correct image immediately upon opening
      setTimeout(() => {
        if (fullscreenScrollRef.current) {
          const width = fullscreenScrollRef.current.clientWidth;
          fullscreenScrollRef.current.scrollTo({
            left: width * activeImageIndex,
            behavior: "instant",
          });
        }
      }, 10);
    } else {
      document.body.style.overflow = "";
      // Ensure the main carousel reflects the index from fullscreen when closed
      setTimeout(() => {
        if (scrollContainerRef.current) {
          const width = scrollContainerRef.current.clientWidth;
          scrollContainerRef.current.scrollTo({
            left: width * activeImageIndex,
            behavior: "instant",
          });
        }
      }, 10);
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen, activeImageIndex]);

  const openFullscreen = (index: number) => {
    setActiveImageIndex(index);
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  const scrollMainPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeImageIndex > 0) scrollToImage(activeImageIndex - 1, false);
  };

  const scrollMainNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeImageIndex < images.length - 1) scrollToImage(activeImageIndex + 1, false);
  };

  return (
    <>
      <div className="relative w-full aspect-square bg-card group">
        {/* Swipeable Carousel */}
        <div
          ref={scrollContainerRef}
          className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
          onScroll={handleScroll}
        >
          {images.map((img, index) => (
            <div
              key={index}
              className="w-full h-full flex-shrink-0 snap-center snap-always relative cursor-pointer"
              onClick={() => openFullscreen(index)}
            >
              <Image
                src={img}
                alt={`${productName} - ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        {/* Desktop Main Navigation Controls */}
        <div className="absolute inset-y-0 left-0 right-0 hidden md:flex items-center justify-between px-2 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={scrollMainPrev}
            disabled={activeImageIndex === 0}
            className="p-2 rounded-full bg-white/50 hover:bg-white/80 text-black pointer-events-auto backdrop-blur-sm shadow-sm transition-colors disabled:opacity-0 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollMainNext}
            disabled={activeImageIndex === images.length - 1}
            className="p-2 rounded-full bg-white/50 hover:bg-white/80 text-black pointer-events-auto backdrop-blur-sm shadow-sm transition-colors disabled:opacity-0 disabled:pointer-events-none"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Thumbnail preview - only if multiple images */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2 py-1.5 rounded-lg max-w-[80%] overflow-x-auto scrollbar-hide z-10">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToImage(index, false);
                }}
                className={cn(
                  "w-8 h-8 rounded overflow-hidden border flex-shrink-0 relative transition-colors",
                  activeImageIndex === index ? "border-white" : "border-transparent opacity-70",
                )}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              </button>
            ))}
            <span className="text-white text-xs ml-1 whitespace-nowrap font-medium">
              {activeImageIndex + 1}/{images.length}
            </span>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-black animate-in fade-in duration-200">
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 z-[201] p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Desktop Navigation for Fullscreen */}
          <div className="absolute inset-y-0 left-0 right-0 hidden md:flex items-center justify-between px-4 pointer-events-none z-[201]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (activeImageIndex > 0) scrollToImage(activeImageIndex - 1, true);
              }}
              disabled={activeImageIndex === 0}
              className="p-3 rounded-full bg-black/50 hover:bg-black/70 text-white pointer-events-auto transition-colors disabled:opacity-0 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (activeImageIndex < images.length - 1) scrollToImage(activeImageIndex + 1, true);
              }}
              disabled={activeImageIndex === images.length - 1}
              className="p-3 rounded-full bg-black/50 hover:bg-black/70 text-white pointer-events-auto transition-colors disabled:opacity-0 disabled:pointer-events-none"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div
            ref={fullscreenScrollRef}
            className="flex-1 w-full h-full relative flex overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
            onClick={closeFullscreen}
            onScroll={(e) => {
              const scrollLeft = e.currentTarget.scrollLeft;
              const width = e.currentTarget.clientWidth;
              if (width === 0) return;
              setActiveImageIndex(Math.round(scrollLeft / width));
            }}
          >
            {images.map((img, index) => (
              <div
                key={index}
                className="w-full h-full flex-shrink-0 snap-center snap-always relative flex items-center justify-center p-2 pb-24"
              >
                <img
                  loading="lazy"
                  decoding="async"
                  src={img}
                  alt={`${productName} Fullscreen ${index + 1}`}
                  className="max-w-full max-h-full object-contain cursor-zoom-out"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            ))}
          </div>

          {/* Fullscreen Thumbnail Preview */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-md p-2 rounded-xl w-max max-w-[90%] overflow-x-auto scrollbar-hide z-[201]">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    scrollToImage(index, true);
                  }}
                  className={cn(
                    "w-12 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 relative transition-all duration-200",
                    activeImageIndex === index
                      ? "border-white scale-105"
                      : "border-transparent opacity-50 hover:opacity-100",
                  )}
                >
                  <Image
                    src={img}
                    alt={`Fullscreen Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
