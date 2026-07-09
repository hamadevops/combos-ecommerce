import NewsDetailContent from "./NewsDetailContent";
import { getPublicServerApiClient } from "@/lib/server-api-config";
import { postsFindOne, postsFindAll } from "@projects/shared";
import { getShopSettings } from "@/lib/fetch-settings";
import { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const apiClient = getPublicServerApiClient();
  let storeName = "Cửa hàng";
  
  try {
    const settings = await getShopSettings();
    storeName = settings.storeName || "Cửa hàng";
  } catch (e) {
    console.warn("[SEO] Failed to fetch shop settings for news detail metadata:", e);
  }

  try {
    const { data: response } = await postsFindOne({ client: apiClient, path: { idOrSlug: slug } });
    const post = response?.data;
    if (post) {
      const metaTitle = post.metaTitle || `${post.title} | ${storeName}`;
      const metaDesc = post.metaDescription || post.excerpt || `Đọc bài viết ${post.title} tại ${storeName}.`;
      
      return {
        title: metaTitle,
        description: metaDesc,
        alternates: {
          canonical: `${BASE_URL}/tin-tuc/${slug}`,
        },
        openGraph: {
          title: metaTitle,
          description: metaDesc,
          url: `${BASE_URL}/tin-tuc/${slug}`,
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
    console.warn(`[SEO] Failed to fetch post metadata for ${slug}:`, error);
  }

  return {
    title: `Chi tiết tin tức | ${storeName}`,
    description: "Chi tiết bài viết mới nhất",
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const apiClient = getPublicServerApiClient();
  let article = null;
  let popularArticles: any[] = [];
  let relatedArticles: any[] = [];

  try {
    // Fetch the specific article by slug
    const { data: articleResponse } = await postsFindOne({ client: apiClient, path: { idOrSlug: slug } });
    const postData = articleResponse?.data;

    if (postData) {
      article = {
        title: postData.title,
        excerpt: postData.excerpt || "",
        content: postData.content || "",
        thumbnail: postData.thumbnail || "",
        slug: postData.slug,
        date: postData.publishedAt ? new Date(postData.publishedAt).toLocaleDateString('vi-VN') : 
              postData.createdAt ? new Date(postData.createdAt).toLocaleDateString('vi-VN') : undefined,
        category: postData.topics?.[0]?.name || "Tin tức",
      };

      // Fetch popular posts sorted by views
      const { data: popularResponse } = await postsFindAll({
        client: apiClient,
        query: { limit: 5, is_published: true, sort_by: 'most_views' } as any
      });
      const allPopular = popularResponse?.data;
      if (Array.isArray(allPopular)) {
        popularArticles = allPopular
          .filter((p: any) => p.slug !== slug)
          .map((post: any) => ({
            title: post.title,
            excerpt: post.excerpt || "",
            thumbnail: post.thumbnail || "",
            slug: post.slug,
            date: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') :
                  post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : undefined,
            category: post.topics?.[0]?.name || "Tin tức",
          }))
          .slice(0, 4);
      }

      // Fetch related posts by topic
      const topicId = postData.topics?.[0]?.id;
      if (topicId) {
        const { data: relatedResponse } = await postsFindAll({
          client: apiClient,
          query: { limit: 4, is_published: true, topic_id: topicId } as any
        });
        const related = relatedResponse?.data;
        if (Array.isArray(related)) {
          relatedArticles = related
            .filter((p: any) => p.slug !== slug)
            .map((post: any) => ({
              title: post.title,
              excerpt: post.excerpt || "",
              thumbnail: post.thumbnail || "",
              slug: post.slug,
              date: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') :
                    post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : undefined,
              category: post.topics?.[0]?.name || "Tin tức",
            }))
            .slice(0, 3);
        }
      }

      // Fallback related posts if not enough found
      if (relatedArticles.length < 3) {
        const { data: fallbackResponse } = await postsFindAll({
          client: apiClient,
          query: { limit: 10, is_published: true } as any
        });
        const allPosts = fallbackResponse?.data;
        if (Array.isArray(allPosts)) {
          const fallbackItems = allPosts
            .filter((p: any) => p.slug !== slug && !popularArticles.some((pop) => pop.slug === p.slug))
            .map((post: any) => ({
              title: post.title,
              excerpt: post.excerpt || "",
              thumbnail: post.thumbnail || "",
              slug: post.slug,
              date: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') :
                    post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : undefined,
              category: post.topics?.[0]?.name || "Tin tức",
            }));
          
          relatedArticles = [...relatedArticles, ...fallbackItems].slice(0, 3);
        }
      }
    }
  } catch (error) {
    console.warn(`[News] Failed to fetch post detail for ${slug}:`, error);
  }

  return <NewsDetailContent article={article} popularArticles={popularArticles} relatedArticles={relatedArticles} />;
}
