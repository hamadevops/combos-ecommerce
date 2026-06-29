import NewsDetailContent from "./NewsDetailContent";
import { getPublicServerApiClient } from "@/lib/server-api-config";
import { postsFindOne, postsFindAll } from "@projects/shared";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const apiClient = getPublicServerApiClient();
  try {
    const { data: response } = await postsFindOne({ client: apiClient, path: { idOrSlug: params.slug } });
    const post = response?.data;
    if (post) {
      return {
        title: post.metaTitle || post.title,
        description: post.metaDescription || post.excerpt,
        openGraph: {
          title: post.metaTitle || post.title,
          description: post.metaDescription || post.excerpt,
          images: post.thumbnail ? [post.thumbnail] : [],
        },
      };
    }
  } catch (error) {
    console.error("Error fetching metadata:", error);
  }

  return {
    title: "Chi tiết tin tức",
    description: "Chi tiết bài viết công nghệ mới nhất",
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
    console.error("Error fetching post detail:", error);
  }

  return <NewsDetailContent article={article} popularArticles={popularArticles} relatedArticles={relatedArticles} />;
}
