"use client";

import React from "react";
import PageLayout from "@/components/tiktok/layout/PageLayout";
import NewsDetail from "@/components/tiktok/news/NewsDetail";

interface NewsDetailContentProps {
  article: any;
  popularArticles: any[];
  relatedArticles: any[];
}

const NewsDetailContent = ({ article, popularArticles, relatedArticles }: NewsDetailContentProps) => {
  if (!article) {
    return (
      <PageLayout headerProps={{ title: "Không tìm thấy bài viết", showBack: true, showSearch: false }}>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <p className="text-gray-500 text-lg">Không tìm thấy bài viết.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout headerProps={{ title: "Chi tiết bài viết", showBack: true, showSearch: false }}>
      <div className="bg-background">
        <NewsDetail 
          article={article}
          popularArticles={popularArticles}
          relatedArticles={relatedArticles}
        />
      </div>
    </PageLayout>
  );
};

export default NewsDetailContent;
