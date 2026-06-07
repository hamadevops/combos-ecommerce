import NewsListContent from "./NewsListContent";
import { getPublicServerApiClient } from "@/lib/server-api-config";
import { postsFindAll } from "@vibe/shared";
import { NewsCardProps } from "@/components/muabantaikhoan/features/news/NewsCard";

export const metadata = {
  title: "Tin tức công nghệ",
  description: "Cập nhật các tin tức công nghệ mới nhất",
};

export default async function NewsListPage() {
  const apiClient = getPublicServerApiClient();
  let articles: NewsCardProps[] = [];

  try {
    const { data: response } = await postsFindAll({ client: apiClient, query: { limit: 12, is_published: true } as any });
    const posts = (response as any)?.data;
    if (Array.isArray(posts)) {
      articles = posts.map((post: any) => ({
        title: post.title,
        excerpt: post.excerpt || "",
        thumbnail: post.thumbnail || "",
        slug: post.slug,
        date: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') :
              post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : undefined,
        category: post.topics?.[0]?.name || "Tin tức",
      }));
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
  }

  return <NewsListContent initialArticles={articles} />;
}
