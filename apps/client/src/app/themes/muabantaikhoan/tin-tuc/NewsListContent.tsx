"use client";

import React from "react";
import DeviceLayoutWrapper from "@/components/muabantaikhoan/layout/DeviceLayoutWrapper";
import NewsList from "@/components/muabantaikhoan/features/news/NewsList";
import { NewsCardProps } from "@/components/muabantaikhoan/features/news/NewsCard";

interface NewsListContentProps {
  initialArticles: NewsCardProps[];
}

const NewsListContent = ({ initialArticles }: NewsListContentProps) => {
  return (
    <DeviceLayoutWrapper>
      <NewsList articles={initialArticles} />
    </DeviceLayoutWrapper>
  );
};

export default NewsListContent;
