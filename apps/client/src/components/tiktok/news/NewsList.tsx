"use client";

import React, { useState, useMemo } from "react";
import NewsCard, { NewsCardProps } from "./NewsCard";
import EmptyState from "@/components/tiktok/ui/EmptyState";
import { Flame, FileText } from "lucide-react";

interface NewsListProps {
  articles: NewsCardProps[];
  categories?: string[];
}

export default function NewsList({ articles, categories: propCategories }: NewsListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả");

  // Use backend categories if provided, otherwise extract from articles
  const categories = useMemo(() => {
    if (propCategories && propCategories.length > 0) {
      // Remove duplicate "Tất cả" if any, and make sure "Tất cả" is first
      const list = new Set<string>();
      list.add("Tất cả");
      propCategories.forEach((cat) => {
        if (cat) list.add(cat);
      });
      return Array.from(list);
    }
    const list = new Set<string>();
    list.add("Tất cả");
    articles.forEach((art) => {
      if (art.category) list.add(art.category);
    });
    return Array.from(list);
  }, [articles, propCategories]);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    if (selectedCategory === "Tất cả") return articles;
    return articles.filter((art) => art.category === selectedCategory);
  }, [articles, selectedCategory]);

  return (
    <div className="bg-zinc-50 dark:bg-black min-h-screen pb-16">
      {/* Scrollable Categories Header */}
      <div className="sticky top-12 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-900 py-3 px-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-[#FE2C55] text-white shadow-sm"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-[#FE2C55] to-[#25F4EE]/30 p-5 rounded-2xl text-white relative overflow-hidden shadow-sm">
          <div className="relative z-10 space-y-1">
            <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              <Flame className="w-3 h-3 fill-white" /> Hot News
            </span>
            <h2 className="text-lg font-extrabold leading-tight">Tin tức</h2>
            <p className="text-xs text-white/85">Cập nhật xu hướng và kiến thức mới nhất mỗi ngày</p>
          </div>
          {/* Decorative light circle */}
          <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        </div>

        {/* News Feed Grid */}
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredArticles.map((article, idx) => (
              <NewsCard key={idx} {...article} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<FileText className="w-8 h-8 text-zinc-400 dark:text-zinc-600 stroke-[1.5]" />}
            title="Bản tin trống"
            description="Chưa có bài viết nào thuộc danh mục này"
          />
        )}
      </div>
    </div>
  );
}
