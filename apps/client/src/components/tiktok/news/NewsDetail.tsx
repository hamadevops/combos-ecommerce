"use client";

import React from "react";
import Link from "next/link";
import NewsCard, { NewsCardProps } from "./NewsCard";
import { getImageUrl } from "@/lib/utils";
import { Calendar, User, Eye, Share2 } from "lucide-react";
import { toast } from "sonner";

interface NewsDetailProps {
  article: {
    title: string;
    content: string;
    date: string;
    category: string;
    thumbnail: string;
  };
  popularArticles: NewsCardProps[];
  relatedArticles: NewsCardProps[];
}

export default function NewsDetail({ article, popularArticles, relatedArticles }: NewsDetailProps) {
  // Safe date parsing and formatting
  const formattedDate = () => {
    if (!article.date) return "";
    try {
      const d = new Date(article.date);
      if (isNaN(d.getTime())) return article.date;
      return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch {
      return article.date;
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Đã sao chép liên kết bài viết!");
    }
  };

  return (
    <div className="bg-white dark:bg-black min-h-screen pb-20">
      {/* Hero Cover Image */}
      {article.thumbnail && (
        <div className="w-full aspect-[16/9] bg-zinc-100 dark:bg-zinc-900 relative overflow-hidden">
          <img
            src={getImageUrl(article.thumbnail)}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          
          {/* Category Badge on Cover */}
          <span className="absolute bottom-4 left-4 bg-[#FE2C55] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            {article.category}
          </span>
        </div>
      )}

      {/* Article Container */}
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-xl font-black text-zinc-900 dark:text-zinc-50 leading-tight">
            {article.title}
          </h1>

          {/* Author, Date, Share */}
          <div className="flex items-center justify-between border-y border-zinc-100 dark:border-zinc-900 py-3 text-xs text-zinc-500">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-zinc-400" />
                Ban biên tập
              </span>
              <span className="w-1 h-1 bg-zinc-300 rounded-full" />
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                {formattedDate()}
              </span>
            </div>
            <button 
              onClick={handleShare}
              className="p-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 text-zinc-600 dark:text-zinc-400 rounded-full hover:bg-zinc-100 active:scale-95 transition-all"
              aria-label="Chia sẻ bài viết"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <article className="prose prose-zinc max-w-none dark:prose-invert 
          text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 
          prose-img:rounded-xl prose-img:shadow-sm prose-img:mx-auto 
          prose-a:text-[#FE2C55] prose-strong:text-zinc-900 dark:prose-strong:text-white
          prose-headings:text-zinc-900 dark:prose-headings:text-white
          prose-headings:font-bold prose-headings:mt-6 prose-headings:mb-3"
        >
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </article>

        {/* Popular Articles Sidebar replacement on Mobile (Horizontal scroll) */}
        {popularArticles && popularArticles.length > 0 && (
          <div className="space-y-3 pt-6 border-t border-zinc-100 dark:border-zinc-900">
            <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-4 bg-[#FE2C55] rounded-full inline-block" />
              Xu hướng đọc
            </h3>
            
            <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x pb-2">
              {popularArticles.map((item, idx) => (
                <Link 
                  key={idx} 
                  href={`/tin-tuc/${item.slug}`} 
                  className="flex-shrink-0 w-64 bg-zinc-50 dark:bg-zinc-900 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/50 snap-start flex gap-3 group active:scale-[0.98] transition-transform"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800 flex-shrink-0">
                    <img 
                      src={getImageUrl(item.thumbnail)} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-col justify-center min-w-0">
                    <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 line-clamp-2 leading-snug group-hover:text-[#FE2C55] transition-colors">
                      {item.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related News at the bottom (Native Mobile Grid) */}
        {relatedArticles && relatedArticles.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-900">
            <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-4 bg-[#FE2C55] rounded-full inline-block" />
              Bài viết liên quan
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {relatedArticles.map((item, idx) => (
                <NewsCard key={idx} {...item} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
