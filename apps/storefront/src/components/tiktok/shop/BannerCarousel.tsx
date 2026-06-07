import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ExternalLink } from "lucide-react";
import { cn, getImageUrl } from "@/lib/utils";
import { useShopSettings } from "@/hooks/useShopSettings";

const BannerCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { getJsonSetting } = useShopSettings();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fullscreenScrollRef = useRef<HTMLDivElement>(null);

  // Get slider data from settings
  let banners: any[] = getJsonSetting("home_slider", []);

  // Normalize if old format (array of strings) or new format (array of objects)
  if (Array.isArray(banners) && banners.length > 0 && typeof banners[0] === "string") {
    banners = banners.map((url) => ({ image: url, link: "" }));
  }

  if (!banners || !Array.isArray(banners) || banners.length === 0) {
    banners = [{ image: "/placeholder.svg", link: "" }];
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    if (width === 0) return;
    const index = Math.round(scrollLeft / width);
    setActiveIndex(index);
  };

  const scrollToBanner = (index: number, isFullscreenTarget: boolean = false) => {
    setActiveIndex(index);
    const ref = isFullscreenTarget ? fullscreenScrollRef : scrollContainerRef;
    if (ref.current) {
      const width = ref.current.clientWidth;
      ref.current.scrollTo({
        left: width * index,
        behavior: "smooth",
      });
    }
  };

  // Auto layout effect
  useEffect(() => {
    if (banners.length <= 1 || isFullscreen) return; // Pause autoplay if fullscreen is open
    const timer = setInterval(() => {
      const nextIndex = (activeIndex + 1) % banners.length;
      scrollToBanner(nextIndex, false);
    }, 4000);

    return () => clearInterval(timer);
  }, [banners.length, activeIndex, isFullscreen]);

  // Sync scroll positions between normal and fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        if (fullscreenScrollRef.current) {
          const width = fullscreenScrollRef.current.clientWidth;
          fullscreenScrollRef.current.scrollTo({
            left: width * activeIndex,
            behavior: "instant",
          });
        }
      }, 10);
    } else {
      document.body.style.overflow = "";
      setTimeout(() => {
        if (scrollContainerRef.current) {
          const width = scrollContainerRef.current.clientWidth;
          scrollContainerRef.current.scrollTo({
            left: width * activeIndex,
            behavior: "instant",
          });
        }
      }, 10);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen, activeIndex]);

  const scrollMainPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIndex > 0) scrollToBanner(activeIndex - 1, false);
  };

  const scrollMainNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIndex < banners.length - 1) scrollToBanner(activeIndex + 1, false);
  };

  return (
    <>
      <div className="relative group">
        <div className="overflow-hidden rounded-lg relative aspect-[16/9] sm:aspect-[21/9]">
          <div
            ref={scrollContainerRef}
            className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
            onScroll={handleScroll}
          >
            {banners.map((banner, index) => (
              <div
                key={index}
                className="w-full h-full flex-shrink-0 snap-center snap-always relative cursor-pointer"
                onClick={() => {
                  setActiveIndex(index);
                  setIsFullscreen(true);
                }}
              >
                <Image
                  src={getImageUrl(banner.image) || "/placeholder.svg"}
                  alt={`Banner ${index + 1}`}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 1200px"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>

          {/* Desktop Main Navigation Controls */}
          {banners.length > 1 && (
            <div className="absolute inset-y-0 left-0 right-0 hidden md:flex items-center justify-between px-2 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={scrollMainPrev}
                disabled={activeIndex === 0}
                className="p-2 rounded-full bg-white/50 hover:bg-white/80 text-black pointer-events-auto backdrop-blur-sm shadow-sm transition-colors disabled:opacity-0 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={scrollMainNext}
                disabled={activeIndex === banners.length - 1}
                className="p-2 rounded-full bg-white/50 hover:bg-white/80 text-black pointer-events-auto backdrop-blur-sm shadow-sm transition-colors disabled:opacity-0 disabled:pointer-events-none"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-1.5 mt-3">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToBanner(index, false)}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all",
                index === activeIndex ? "w-4 bg-primary" : "bg-muted-foreground/50",
              )}
            />
          ))}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-black animate-in fade-in duration-200">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-[201] p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Visit Link Button if banner has link */}
          {banners[activeIndex]?.link && (
            <Link
              href={banners[activeIndex].link}
              className="absolute top-4 left-4 z-[201] p-3 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground flex items-center gap-2 transition-colors font-medium text-sm"
              onClick={() => setIsFullscreen(false)}
            >
              <ExternalLink className="w-4 h-4 ml-0.5" />
              <span className="mr-0.5 pr-1">Truy cập liền</span>
            </Link>
          )}

          {/* Desktop Navigation for Fullscreen */}
          {banners.length > 1 && (
            <div className="absolute inset-y-0 left-0 right-0 hidden md:flex items-center justify-between px-4 pointer-events-none z-[201]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (activeIndex > 0) scrollToBanner(activeIndex - 1, true);
                }}
                disabled={activeIndex === 0}
                className="p-3 rounded-full bg-black/50 hover:bg-black/70 text-white pointer-events-auto transition-colors disabled:opacity-0 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (activeIndex < banners.length - 1) scrollToBanner(activeIndex + 1, true);
                }}
                disabled={activeIndex === banners.length - 1}
                className="p-3 rounded-full bg-black/50 hover:bg-black/70 text-white pointer-events-auto transition-colors disabled:opacity-0 disabled:pointer-events-none"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}

          <div
            ref={fullscreenScrollRef}
            className="flex-1 w-full h-full relative flex overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
            onClick={() => setIsFullscreen(false)}
            onScroll={(e) => {
              const scrollLeft = e.currentTarget.scrollLeft;
              const width = e.currentTarget.clientWidth;
              if (width === 0) return;
              setActiveIndex(Math.round(scrollLeft / width));
            }}
          >
            {banners.map((banner, index) => (
              <div
                key={index}
                className="w-full h-full flex-shrink-0 snap-center snap-always relative flex items-center justify-center p-2 pb-12"
              >
                <img
                  loading="lazy"
                  src={getImageUrl(banner.image) || "/placeholder.svg"}
                  alt={`Banner Fullscreen ${index + 1}`}
                  className="max-w-full max-h-full object-contain cursor-zoom-out"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default BannerCarousel;
