import React from "react";
import Link from "next/link";
import { getImageUrl } from "@/lib/utils";

export interface NewsCardProps {
  title: string;
  excerpt: string;
  thumbnail: string;
  slug: string;
  date?: string;
  category?: string;
}

export default function NewsCard({
  title,
  excerpt,
  thumbnail,
  slug,
  date,
  category,
}: NewsCardProps) {
  return (
    <div className="flex flex-col group">
      {/* Thumbnail */}
      <Link href={`/tin-tuc/${slug}`} className="block relative aspect-[16/10] overflow-hidden rounded-lg mb-4">
        <img
          src={getImageUrl(thumbnail) || "https://placehold.co/600x375/e2e8f0/64748b?text=News"}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {category && (
          <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-1 uppercase rounded-sm z-10">
            {category}
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-grow">
        {date && (
          <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
            {date}
          </div>
        )}
        
        <Link href={`/tin-tuc/${slug}`}>
          <h3 className="text-lg font-bold text-gray-900 leading-snug mb-3 group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
        </Link>
        
        <div className="w-10 h-[2px] bg-red-600 mb-3"></div>
        
        <p className="text-sm text-gray-600 line-clamp-3">
          {excerpt}
        </p>
      </div>
    </div>
  );
}
