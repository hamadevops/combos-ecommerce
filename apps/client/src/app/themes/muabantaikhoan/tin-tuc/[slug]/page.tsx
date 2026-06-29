import NewsDetailContent from "./NewsDetailContent";
import { getPublicServerApiClient } from "@/lib/server-api-config";
import { postsFindOne, postsFindAll } from "@projects/shared";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const apiClient = getPublicServerApiClient();
  try {
    const { data: response } = await postsFindOne({ client: apiClient, path: { idOrSlug: slug } });
    const post = (response as any)?.data;
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

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const apiClient = getPublicServerApiClient();
  let article = null;
  let popularArticles: any[] = [];
  let relatedArticles: any[] = [];

  try {
    // Fetch the specific article by slug
    const { data: articleResponse } = await postsFindOne({ client: apiClient, path: { idOrSlug: slug } });
    const postData = (articleResponse as any)?.data;

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
      const allPopular = (popularResponse as any)?.data;
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
        const related = (relatedResponse as any)?.data;
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
        const allPosts = (fallbackResponse as any)?.data;
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
    console.error("Error fetching post detail:", error);
  }

  return <NewsDetailContent article={article} popularArticles={popularArticles} relatedArticles={relatedArticles} />;
}
