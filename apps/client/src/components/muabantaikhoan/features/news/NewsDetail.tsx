import React from "react";
import Link from "next/link";
import NewsCard, { NewsCardProps } from "./NewsCard";
import { getImageUrl } from "@/lib/utils";

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
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="flex text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <span className="mx-2">/</span>
          <Link href="/tin-tuc" className="hover:text-primary transition-colors">
            Tin tức công nghệ
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium line-clamp-1">{article.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content (75%) */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8 mb-8">
              
              {/* Category & Title */}
              <div className="mb-6">
                <div className="text-primary text-xs font-bold uppercase tracking-wider mb-3">
                  {article.category}
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight mb-4">
                  {article.title}
                </h1>
                <div className="flex items-center text-sm text-gray-500 mb-6">
                  <span className="uppercase">{article.date}</span>
                </div>
                <div className="w-16 h-[3px] bg-red-600 mb-8"></div>
              </div>

              {/* Cover Image */}
              {article.thumbnail && (
                <div className="w-full max-h-[400px] aspect-[16/9] rounded-xl overflow-hidden mb-8 bg-gray-100 relative">
                  <img
                    src={getImageUrl(article.thumbnail)}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content Body */}
              <div className="prose max-w-none text-gray-700 leading-relaxed">
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              </div>
            </div>
          </div>

          {/* Sidebar (25%) */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-6 uppercase border-l-4 border-red-600 pl-3">
                Bài viết phổ biến
              </h3>
              
              <div className="space-y-6">
                {popularArticles.map((item, idx) => (
                  <Link key={idx} href={`/tin-tuc/${item.slug}`} className="flex gap-4 group">
                    <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                      <img 
                        src={getImageUrl(item.thumbnail)} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h4 className="text-xs font-bold text-gray-800 line-clamp-3 group-hover:text-primary transition-colors leading-snug">
                        {item.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
        </div>

        {/* Related News at the bottom */}
        {relatedArticles && relatedArticles.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 uppercase border-l-4 border-red-600 pl-3">
              Bài viết liên quan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
