import { getQueryClient } from "@/lib/get-query-client";
import { getServerApiClient, getPublicServerApiClient } from "@/lib/server-api-config";
import { productApi } from "@/api/product";
import { categoryApi } from "@/api/category";
import { settingsService } from "@/services/settings.service";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import HomeContent from "./HomeContent";
import { getShopSettings } from "@/lib/fetch-settings";
import { getImageUrl } from "@/lib/utils";

import { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://phanphoichinhhang.com";

export async function generateMetadata(): Promise<Metadata> {
  const { storeName, storeDescription, storeOgImage } = await getShopSettings();
  const ogImageUrl = storeOgImage ? getImageUrl(storeOgImage) : "/android-icon-192x192.png";

  return {
    title: `${storeName} - ${storeDescription}`,
    description: storeDescription,
    alternates: {
      canonical: BASE_URL,
    },
    openGraph: {
      title: storeName,
      description: storeDescription,
      url: BASE_URL,
      siteName: storeName,
      type: "website",
      images: [{ url: ogImageUrl as string }],
    },
    twitter: {
      card: "summary_large_image",
      title: storeName,
      description: storeDescription,
      images: [ogImageUrl as string],
    },
  };
}

export default async function HomePage() {
  const queryClient = getQueryClient();
  const apiClient = getPublicServerApiClient();

  // Fetch settings for Organization JSON-LD
  let settings: Record<string, any> = {};
  try {
    settings = await settingsService.getPublic({ client: apiClient });
  } catch (e) {
    // fallback
  }

  // Prefetch data in parallel
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["categories"],
      queryFn: () => categoryApi.getList(undefined, { client: apiClient }),
      staleTime: 60000,
    }),
    queryClient.prefetchQuery({
      queryKey: ["products", { sort: "newest", limit: 10 }],
      queryFn: () => productApi.getList({ sort: "newest", limit: 10 }, { client: apiClient }),
      staleTime: 60000,
    }),
    queryClient.prefetchQuery({
      queryKey: ["products", { isFeatured: true, limit: 10 }],
      queryFn: () => productApi.getList({ isFeatured: true, limit: 10 }, { client: apiClient }),
      staleTime: 60000,
    }),
    queryClient.prefetchQuery({
      queryKey: ["products", { limit: 20 }],
      queryFn: () => productApi.getList({ limit: 20 }, { client: apiClient }),
      staleTime: 60000,
    }),
    queryClient.prefetchInfiniteQuery({
      queryKey: ["products-infinite", { sort: undefined, limit: 12 }],
      queryFn: () => productApi.getList({ limit: 12 }, { client: apiClient }),
      initialPageParam: 1,
      staleTime: 60000,
    }),
  ]);

  // Build social links array
  const socials = [
    settings.social_facebook,
    settings.social_instagram,
    settings.social_tiktok,
    settings.social_zalo,
  ].filter(Boolean);

  return (
    <>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <HomeContent />
      </HydrationBoundary>
    </>
  );
}
