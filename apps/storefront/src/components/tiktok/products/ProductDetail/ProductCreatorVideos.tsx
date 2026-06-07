import { Play, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/types/product";
import { getImageUrl } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

interface ProductCreatorVideosProps {
  product: Product;
}

const ProductCreatorVideos = ({ product }: ProductCreatorVideosProps) => {
  const [activeVideo, setActiveVideo] = useState<NonNullable<Product["videos"]>[number] | null>(
    null,
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollStartPos, setScrollStartPos] = useState(0);
  const [dragged, setDragged] = useState(false);

  // Fullscreen touch states
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  // Handle body scroll locking
  useEffect(() => {
    if (activeVideo) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [activeVideo]);

  const videos =
    product.videos
      ?.filter((v) => v.isVisible === 1)
      .sort((a, b) => a.displayOrder - b.displayOrder) || [];

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setDragged(false);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollStartPos(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    if (Math.abs(walk) > 5) {
      setDragged(true);
    }
    scrollContainerRef.current.scrollLeft = scrollStartPos - walk;
  };

  const handleVideoClick = (video: NonNullable<Product["videos"]>[number]) => {
    if (!dragged) {
      setActiveVideo(video);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  const handleModalTouchStart = (e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleModalTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || !activeVideo) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchStart.x - touchEndX;
    const deltaY = touchStart.y - touchEndY;
    const activeIndex = videos.findIndex((v) => v.id === activeVideo.id);

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0 && activeIndex < videos.length - 1) setActiveVideo(videos[activeIndex + 1]);
      else if (deltaX < 0 && activeIndex > 0) setActiveVideo(videos[activeIndex - 1]);
    } else if (Math.abs(deltaY) > 50) {
      if (deltaY > 0 && activeIndex < videos.length - 1) setActiveVideo(videos[activeIndex + 1]);
      else if (deltaY < 0 && activeIndex > 0) setActiveVideo(videos[activeIndex - 1]);
    }
    setTouchStart(null);
  };

  if (videos.length === 0) return null;

  return (
    <>
      <div className="bg-background pt-4 pb-2">
        <div className="px-4 mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-foreground">
            Video từ nhà sáng tạo ({videos.length > 30 ? "30+" : videos.length})
          </h2>
          {videos.length > 3 && (
            <div className="hidden md:flex items-center gap-1.5">
              <button
                onClick={scrollLeft}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 text-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4 pr-[1px]" />
              </button>
              <button
                onClick={scrollRight}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 text-foreground transition-colors"
              >
                <ChevronRight className="w-4 h-4 pl-[1px]" />
              </button>
            </div>
          )}
        </div>

        <div
          ref={scrollContainerRef}
          className="flex gap-2.5 px-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {videos.map((video) => (
            <div
              key={video.id}
              className="relative flex-none w-[112px] h-[150px] rounded-xl overflow-hidden bg-muted cursor-pointer snap-start shrink-0"
              onClick={() => handleVideoClick(video)}
            >
              {video.thumbnailUrl ? (
                <img
                  loading="lazy"
                  decoding="async"
                  src={getImageUrl(video.thumbnailUrl)}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />
              ) : (
                <video
                  src={`${getImageUrl(video.videoUrl)}#t=0.1`}
                  className="w-full h-full object-cover pointer-events-none"
                  muted
                  playsInline
                  preload="metadata"
                  onLoadedData={(e) => {
                    const el = e.currentTarget;
                    if (el.currentTime === 0) {
                      el.currentTime = 0.1;
                    }
                  }}
                />
              )}

              {/* Play Button Overlay */}
              <div className="absolute top-2 left-2 w-6 h-6 bg-black/30 rounded-full flex items-center justify-center backdrop-blur-sm pointer-events-none">
                <Play className="w-3 h-3 text-white fill-white ml-0.5" />
              </div>

              {/* Gradient bottom for text readability */}
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent opacity-80 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Video Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-[100] bg-black sm:max-w-md sm:mx-auto flex flex-col items-center justify-center">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-end z-[110] bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
            <button
              onClick={() => setActiveVideo(null)}
              className="w-8 h-8 flex items-center justify-center bg-black/40 rounded-full text-white backdrop-blur-sm pointer-events-auto"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            className="relative w-full h-full flex items-center justify-center bg-black"
            onTouchStart={handleModalTouchStart}
            onTouchEnd={handleModalTouchEnd}
          >
            {(() => {
              const activeIndex = videos.findIndex((v) => v.id === activeVideo.id);
              return (
                <>
                  {activeIndex > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveVideo(videos[activeIndex - 1]);
                      }}
                      className="absolute left-4 z-[110] w-10 h-10 hidden md:flex items-center justify-center bg-black/40 rounded-full text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6 pr-0.5" />
                    </button>
                  )}

                  <video
                    key={activeVideo.id}
                    src={getImageUrl(activeVideo.videoUrl)}
                    className="w-full max-h-full object-contain"
                    autoPlay
                    controls
                    playsInline
                    loop
                  />

                  {activeIndex >= 0 && activeIndex < videos.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveVideo(videos[activeIndex + 1]);
                      }}
                      className="absolute right-4 z-[110] w-10 h-10 hidden md:flex items-center justify-center bg-black/40 rounded-full text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
                    >
                      <ChevronRight className="w-6 h-6 pl-0.5" />
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCreatorVideos;
