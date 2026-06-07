'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useShopSettings } from '@/hooks/useShopSettings';
import { getImageUrl } from '@/lib/utils';

export interface SlideItem {
  id?: string;
  image: string;
  link?: string;
}

export default function HeroSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { getJsonSetting } = useShopSettings();

  const slides: SlideItem[] = getJsonSetting('home_slider', []);

  const defaultSlides: SlideItem[] = [
    { image: "https://muataikhoanonline.com/wp-content/uploads/2025/01/382472886-6abdffba-dddd-4965-aac5-d1a89c18eb17-2048x569.jpeg", link: "" },
    { image: "https://muataikhoanonline.com/wp-content/uploads/2025/01/382472622-6e785993-bf50-48f1-b1f6-37f322e04628-2048x569.jpeg", link: "" },
    { image: "https://muataikhoanonline.com/wp-content/uploads/2025/01/382472886-6abdffba-dddd-4965-aac5-d1a89c18eb17-2048x569.jpeg", link: "" }
  ];

  const displaySlides = slides.length > 0 ? slides : defaultSlides;

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    
    // Auto play setup (optional)
    const autoplay = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);
    
    return () => clearInterval(autoplay);
  }, [emblaApi, onSelect]);

  return (
    <div className="relative group bg-gray-50 border-b">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {displaySlides.map((slide, index) => {
            const imageUrl = getImageUrl(slide.image) || '';
            return (
              <div className="flex-[0_0_100%] min-w-0" key={index}>
                {slide.link ? (
                  <Link href={slide.link}>
                    <img 
                      src={imageUrl} 
                      alt={`Slide ${index + 1}`} 
                      className="w-full h-auto object-cover md:h-[400px] lg:h-[500px]"
                    />
                  </Link>
                ) : (
                  <img 
                    src={imageUrl} 
                    alt={`Slide ${index + 1}`} 
                    className="w-full h-auto object-cover md:h-[400px] lg:h-[500px]"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button 
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
      >
        <ChevronLeft size={24} />
      </button>
      
      <button 
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
      >
        <ChevronRight size={24} />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {displaySlides.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === selectedIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
