import React from "react";
import Link from "next/link";
import NewsCard, { NewsCardProps } from "./NewsCard";

interface NewsListProps {
  articles: NewsCardProps[];
}

export default function NewsList({ articles }: NewsListProps) {
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="flex text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Tin tức công nghệ</span>
        </nav>

        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8 uppercase border-l-4 border-red-600 pl-4">
          Tin tức công nghệ
        </h1>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {articles.map((article, idx) => (
            <NewsCard key={idx} {...article} />
          ))}
        </div>

      </div>
    </div>
  );
}
