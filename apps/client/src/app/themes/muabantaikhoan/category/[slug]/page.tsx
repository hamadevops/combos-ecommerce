import { getQueryClient } from "@/lib/get-query-client";
import { getPublicServerApiClient } from "@/lib/server-api-config";
import { categoryApi } from "@/api/category";
import { productApi } from "@/api/product";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import CategoryDetailContent from "./CategoryDetailContent";
import { notFound } from "next/navigation";
import { getShopSettings } from "@/lib/fetch-settings";
import { getImageUrl } from "@/lib/utils";

import { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://phanphoichinhhang.com";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const apiClient = getPublicServerApiClient();
  const { storeName } = await getShopSettings();

  try {
    const categoryRes = await categoryApi.getBySlug(slug, { client: apiClient });
    const category = categoryRes.data;

    const title = category.name;
    const description =
      category.description || `Khám phá các sản phẩm ${category.name} tại ${storeName}`;
    const imageUrl = (category as any).image ? getImageUrl((category as any).image) : undefined;

    return {
      title,
      description,
      alternates: {
        canonical: `${BASE_URL}/danh-muc/${slug}`,
      },
      openGraph: {
        title: `${title} | ${storeName}`,
        description,
        url: `${BASE_URL}/danh-muc/${slug}`,
        siteName: storeName,
        type: "website",
        images: imageUrl ? [{ url: imageUrl, alt: category.name }] : [],
      },
      twitter: {
        card: "summary",
        title: `${title} | ${storeName}`,
        description,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    return {
      title: "Danh mục không tìm thấy",
      robots: { index: false },
    };
  }
}

export default async function CategoryDetailPage({ params }: Props) {
  const { slug } = await params;
  const queryClient = getQueryClient();
  const apiClient = getPublicServerApiClient();

  let category: any = null;

  try {
    // Fetch category first to get ID for product prefetch
    const categoryRes = await categoryApi.getBySlug(slug, { client: apiClient });
    category = categoryRes.data;

    if (category) {
      // Prefetch data in parallel with correct keys
      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: ["categories", slug],
          queryFn: () => Promise.resolve(category),
        }),
        queryClient.prefetchInfiniteQuery({
          queryKey: ["products-infinite", { categoryIds: [category.id], sort: undefined, limit: 12 }],
          queryFn: () =>
            productApi.getList({ categoryIds: [category.id], limit: 12 }, { client: apiClient }),
          initialPageParam: 1,
        }),
      ]);
    }
  } catch (error) {
    // Ignore error so we can show dummy data on client side
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CategoryDetailContent />
    </HydrationBoundary>
  );
}
