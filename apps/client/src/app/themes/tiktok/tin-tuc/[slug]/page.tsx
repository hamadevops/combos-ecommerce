import NewsDetailContent from "./NewsDetailContent";
import { getPublicServerApiClient } from "@/lib/server-api-config";
import { postsFindOne, postsFindAll } from "@projects/shared";
import { getShopSettings } from "@/lib/fetch-settings";
import { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const apiClient = getPublicServerApiClient();
  let storeName = "Cửa hàng";
  
  try {
    const settings = await getShopSettings();
    storeName = settings.storeName || "Cửa hàng";
  } catch (e) {
    console.warn("[SEO] Failed to fetch shop settings for news detail metadata:", e);
  }

  try {
    const { data: response } = await postsFindOne({ client: apiClient, path: { idOrSlug: params.slug } });
    const post = response?.data;
    if (post) {
      const metaTitle = post.metaTitle || `${post.title} | ${storeName}`;
      const metaDesc = post.metaDescription || post.excerpt || `Đọc bài viết ${post.title} tại ${storeName}.`;
      
      return {
        title: metaTitle,
        description: metaDesc,
        alternates: {
          canonical: `${BASE_URL}/tin-tuc/${params.slug}`,
        },
        openGraph: {
          title: metaTitle,
          description: metaDesc,
          url: `${BASE_URL}/tin-tuc/${params.slug}`,
          siteName: storeName,
          type: "article",
          images: post.thumbnail ? [{ url: post.thumbnail }] : [],
        },
        twitter: {
          card: "summary_large_image",
          title: metaTitle,
          description: metaDesc,
          images: post.thumbnail ? [post.thumbnail] : [],
        },
      };
    }
  } catch (error) {
    console.warn(`[SEO] Failed to fetch post metadata for ${params.slug}:`, error);
  }

  return {
    title: `Chi tiết tin tức | ${storeName}`,
    description: "Chi tiết bài viết mới nhất",
  };
}

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
  const apiClient = getPublicServerApiClient();
  let article = null;
  let popularArticles: any[] = [];
  let relatedArticles: any[] = [];

  try {
    const { data: response } = await postsFindAll({ client: apiClient, query: { limit: 20, is_published: true } });
    if (response?.data) {
      const allPosts = response.data.map((post) => ({
        title: post.title,
        excerpt: post.excerpt || "",
        content: post.content || "",
        thumbnail: post.thumbnail || "",
        slug: post.slug,
        date: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : undefined,
        category: post.topics?.[0]?.name || "Tin tức",
      }));
      
      article = allPosts.find((p) => p.slug === params.slug) || null;
      const others = allPosts.filter((p) => p.slug !== params.slug);
      popularArticles = others.slice(0, 4);
      relatedArticles = others.slice(4, 7);
    }
  } catch (error) {
    console.warn(`[News] Failed to fetch post detail for ${params.slug}:`, error);
  }

  return <NewsDetailContent article={article} popularArticles={popularArticles} relatedArticles={relatedArticles} />;
}
