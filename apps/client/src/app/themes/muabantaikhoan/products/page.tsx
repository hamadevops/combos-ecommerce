import { getQueryClient } from "@/lib/get-query-client";
import { getPublicServerApiClient } from "@/lib/server-api-config";
import { productApi } from "@/api/product";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import ProductsContent from "./ProductsContent";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { getShopSettings } from "@/lib/fetch-settings";

import { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const searchTerm = typeof params.search === "string" ? params.search : undefined;
  const { storeName } = await getShopSettings();

  const title = searchTerm ? `Tìm kiếm "${searchTerm}"` : "Tất cả sản phẩm";
  const description = searchTerm
    ? `Kết quả tìm kiếm cho "${searchTerm}" tại ${storeName}`
    : `Khám phá tất cả sản phẩm tại ${storeName}. Dụng cụ cơ khí chuyên nghiệp, giá tốt nhất.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/san-pham`,
    },
    openGraph: {
      title: `${title} | ${storeName}`,
      description,
      url: `${BASE_URL}/san-pham`,
      siteName: storeName,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${title} | ${storeName}`,
      description,
    },
    robots: {
      index: !searchTerm, // Don't index search results
      follow: true,
    },
  };
}

export default async function ProductsPage({ searchParams }: Props) {
  const queryClient = getQueryClient();
  const apiClient = getPublicServerApiClient();
  const params = await searchParams;

  const searchTerm = typeof params.search === "string" ? params.search : undefined;
  const categoryIdParam = typeof params.categoryId === "string" ? params.categoryId : undefined;
  const categoryIds = categoryIdParam ? [Number(categoryIdParam)] : undefined;

  const fetchParams = {
    search: searchTerm,
    categoryIds,
    limit: 12,
  };

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["products-infinite", fetchParams],
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
      productApi.getList(
        {
          ...fetchParams,
          page: pageParam,
          limit: 12,
        },
        { client: apiClient },
      ),
    initialPageParam: 1,
  });

  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="animate-spin w-8 h-8 text-primary" />
        </div>
      }
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductsContent />
      </HydrationBoundary>
    </Suspense>
  );
}
