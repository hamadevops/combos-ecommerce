import NewsListContent from "./NewsListContent";
import { getPublicServerApiClient } from "@/lib/server-api-config";
import { postsFindAll } from "@projects/shared";
import { NewsCardProps } from "@/components/tiktok/news/NewsCard";
import { getShopSettings } from "@/lib/fetch-settings";
import { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  let storeName = "Cửa hàng";
  try {
    const settings = await getShopSettings();
    storeName = settings.storeName || "Cửa hàng";
  } catch (e) {
    console.warn("[SEO] Failed to fetch shop settings for news list metadata:", e);
  }

  return {
    title: `Tin tức công nghệ | ${storeName}`,
    description: `Cập nhật các tin tức công nghệ mới nhất từ ${storeName}. Hướng dẫn, thủ thuật và tin tức cập nhật mỗi ngày.`,
    alternates: {
      canonical: `${BASE_URL}/tin-tuc`,
    },
    openGraph: {
      title: `Tin tức công nghệ | ${storeName}`,
      description: `Cập nhật các tin tức công nghệ mới nhất từ ${storeName}.`,
      url: `${BASE_URL}/tin-tuc`,
      siteName: storeName,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `Tin tức công nghệ | ${storeName}`,
    },
  };
}

export default async function NewsListPage() {
  const apiClient = getPublicServerApiClient();
  let articles: NewsCardProps[] = [];

  try {
    const { data: response } = await postsFindAll({ client: apiClient, query: { limit: 12, is_published: true } });
    if (response?.data) {
      articles = response.data.map((post) => ({
        title: post.title,
        excerpt: post.excerpt || "",
        thumbnail: post.thumbnail || "",
        slug: post.slug,
        date: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : undefined,
        category: post.topics?.[0]?.name || "Tin tức",
      }));
    }
  } catch (error) {
    console.warn("[News] Failed to fetch posts:", error);
  }

  return <NewsListContent initialArticles={articles} />;
}
