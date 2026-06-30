"use client";

import React from "react";
import Link from "next/link";
import { getImageUrl } from "@/lib/utils";
import { Calendar, ArrowRight, Eye } from "lucide-react";

export interface NewsCardProps {
  title: string;
  excerpt: string;
  thumbnail: string;
  slug: string;
  date?: string;
  category?: string;
  views?: number;
}

export default function NewsCard({
  title,
  excerpt,
  thumbnail,
  slug,
  date,
  category,
  views = Math.floor(Math.random() * 800) + 120,
}: NewsCardProps) {
  // Safe date parsing and formatting
  const formattedDate = () => {
    if (!date) return "";
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return date;
      return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch {
      return date;
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 shadow-sm active:scale-[0.98] transition-all duration-200 flex flex-col h-full group">
      {/* Image / Thumbnail Container */}
      <Link href={`/tin-tuc/${slug}`} className="block relative aspect-[16/10] w-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
        <img
          src={getImageUrl(thumbnail) || "https://placehold.co/600x375/f3f4f6/a8a29e?text=News"}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {category && (
          <span className="absolute top-3 left-3 bg-[#FE2C55] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
            {category}
          </span>
        )}
      </Link>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-grow justify-between gap-3">
        <div className="space-y-2">
          {/* Metadata */}
          <div className="flex items-center gap-3 text-[11px] text-gray-400 dark:text-zinc-500 font-medium">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formattedDate()}
            </span>
            <span className="w-1 h-1 bg-gray-300 dark:bg-zinc-700 rounded-full" />
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {views} lượt xem
            </span>
          </div>

          {/* Title */}
          <Link href={`/tin-tuc/${slug}`} className="block">
            <h3 className="font-bold text-sm text-gray-900 dark:text-zinc-100 leading-snug line-clamp-2 group-hover:text-[#FE2C55] transition-colors">
              {title}
            </h3>
          </Link>

          {/* Excerpt */}
          <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {excerpt}
          </p>
        </div>

        {/* Action Link */}
        <Link 
          href={`/tin-tuc/${slug}`} 
          className="inline-flex items-center gap-1 text-xs font-bold text-[#FE2C55] hover:text-[#dx2448] mt-1 group/btn w-max"
        >
          Đọc tiếp
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
