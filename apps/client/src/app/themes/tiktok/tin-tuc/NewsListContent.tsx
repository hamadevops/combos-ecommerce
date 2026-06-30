"use client";

import React from "react";
import PageLayout from "@/components/tiktok/layout/PageLayout";
import NewsList from "@/components/tiktok/news/NewsList";
import { NewsCardProps } from "@/components/tiktok/news/NewsCard";

interface NewsListContentProps {
  initialArticles: NewsCardProps[];
}

const NewsListContent = ({ initialArticles }: NewsListContentProps) => {
  return (
    <PageLayout headerProps={{ title: "Tin tức công nghệ", showBack: true, showSearch: false }}>
      <div className="bg-background">
        <NewsList articles={initialArticles} />
      </div>
    </PageLayout>
  );
};

export default NewsListContent;
