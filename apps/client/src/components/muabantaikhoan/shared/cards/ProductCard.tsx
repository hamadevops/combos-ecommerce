import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Flame } from 'lucide-react';

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  originalPrice?: number;
  currentPrice: number;
  discountPercent?: number;
  tags?: string[]; // e.g. "Rẻ nhất", "BH 12 tháng"
  isVip?: boolean;
  soldCount?: number;
}

export default function ProductCard({
  name,
  slug,
  thumbnail,
  originalPrice,
  currentPrice,
  discountPercent,
  tags = [],
  isVip = false,
  soldCount = 0,
}: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow relative flex flex-col h-full">
      {/* Discount Badge */}
      {discountPercent && (
        <div className="absolute top-0 left-0 bg-red-600 text-white text-xs font-bold px-2 py-1 z-20 shadow-sm">
          -{discountPercent}%
        </div>
      )}
      
      {/* VIP Badge */}
      {isVip && (
        <div className="absolute top-2 right-2 bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded z-20">
          VIP
        </div>
      )}

      {/* Image */}
      <Link href={`/${slug}`} className="block relative aspect-[1.9] bg-white flex-shrink-0 border-b border-gray-50">
        <img 
          src={thumbnail || "https://placehold.co/400x210/ffffff/a8a29e?text=No+Image"} 
          alt={name} 
          className="absolute inset-0 w-full h-full object-contain"
          onError={(e) => {
            e.currentTarget.src = "https://placehold.co/400x210/ffffff/a8a29e?text=No+Image";
          }}
        />
        
        {/* Tags overlaid on the bottom of the image */}
        {tags.length > 0 && (
          <div className="absolute bottom-1 left-1 flex flex-col gap-1 z-10">
            {tags.map((tag, idx) => (
              <span key={idx} className={`text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-sm shadow-sm w-max ${idx === 0 ? 'bg-red-600' : 'bg-orange-500'}`}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-3 flex flex-col flex-grow">
        {/* Title */}
        <Link href={`/${slug}`}>
          <h3 className="font-bold text-sm text-gray-800 line-clamp-2 hover:text-purple-600 transition-colors mb-2 min-h-[40px]">
            {name}
          </h3>
        </Link>

        {/* Price & Cart */}
        <div className="flex items-end justify-between mt-auto mb-3">
          <div className="flex flex-col">
            {originalPrice && (
              <div className="text-xs text-gray-500 line-through">
                {new Intl.NumberFormat('vi-VN').format(originalPrice)}đ
              </div>
            )}
            <div className="text-red-600 font-bold text-base">
              {new Intl.NumberFormat('vi-VN').format(currentPrice)}đ
            </div>
          </div>
          <button className="bg-gray-800 hover:bg-black text-white p-1.5 rounded transition-colors flex-shrink-0">
            <ShoppingCart size={16} />
          </button>
        </div>

        {/* Sold Progress Bar */}
        {soldCount > 0 && (
          <div className="relative w-full h-5 bg-orange-100 rounded-full overflow-hidden flex items-center mt-auto">
            <div 
              className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-orange-400 to-red-500" 
              style={{ width: `${Math.min((soldCount / 100) * 100, 100)}%` }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-bold drop-shadow-md z-10">
               <Flame size={12} className="mr-0.5" /> Đã bán {soldCount}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
