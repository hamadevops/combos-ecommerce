"use client";

import React from "react";
import DeviceLayoutWrapper from "@/components/muabantaikhoan/layout/DeviceLayoutWrapper";
import NewsDetail from "@/components/muabantaikhoan/features/news/NewsDetail";

interface NewsDetailContentProps {
  article: any;
  popularArticles: any[];
  relatedArticles: any[];
}

const NewsDetailContent = ({ article, popularArticles, relatedArticles }: NewsDetailContentProps) => {
  if (!article) {
    return (
      <DeviceLayoutWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500 text-lg">Không tìm thấy bài viết.</p>
        </div>
      </DeviceLayoutWrapper>
    );
  }

  return (
    <DeviceLayoutWrapper>
      <NewsDetail 
        article={article}
        popularArticles={popularArticles}
        relatedArticles={relatedArticles}
      />
    </DeviceLayoutWrapper>
  );
};

export default NewsDetailContent;
