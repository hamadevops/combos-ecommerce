import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cn, getImageUrl } from "@/lib/utils";
import { useShopSettings } from "@/hooks/useShopSettings";

const BannerCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { getJsonSetting } = useShopSettings();

  // Get slider data from settings
  let banners: any[] = getJsonSetting("home_slider", []);

  // Normalize if old format (array of strings) or new format (array of objects)
  // Ensure we always have objects
  if (Array.isArray(banners) && banners.length > 0 && typeof banners[0] === "string") {
    banners = banners.map((url) => ({ image: url, link: "" }));
  }

  // Fallback if no banners
  if (!banners || !Array.isArray(banners) || banners.length === 0) {
    banners = [{ image: "https://placehold.co/800x400/333/FFF?text=No+Banner", link: "" }];
  }

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="relative px-4">
      <div className="relative overflow-hidden rounded-xl">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {banners.map((banner, index) => (
            <div key={index} className="w-full flex-shrink-0">
              {banner.link ? (
                <Link to={banner.link} className="block w-full">
                  <img
                    src={getImageUrl(banner.image)}
                    alt={`Banner ${index + 1}`}
                    className="w-full aspect-[2/1] object-cover"
                  />
                </Link>
              ) : (
                <img
                  src={getImageUrl(banner.image)}
                  alt={`Banner ${index + 1}`}
                  className="w-full aspect-[2/1] object-cover"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-1.5 mt-3">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all",
              index === activeIndex ? "w-4 bg-primary" : "bg-muted-foreground/50",
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerCarousel;
