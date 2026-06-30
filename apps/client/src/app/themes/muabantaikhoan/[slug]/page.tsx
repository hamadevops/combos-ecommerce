import { getQueryClient } from "@/lib/get-query-client";
import { getPublicServerApiClient } from "@/lib/server-api-config";
import { productApi } from "@/api/product";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import ProductDetailContent from "./ProductDetailContent";
import JsonLd from "@/components/tiktok/common/JsonLd";
import { getImageUrl } from "@/lib/utils";
import { getShopSettings } from "@/lib/fetch-settings";

import { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function stripHtml(html: string | undefined | null): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, "").trim();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const apiClient = getPublicServerApiClient();
  const { storeName } = await getShopSettings();

  try {
    const product = await productApi.getBySlug(slug, { client: apiClient }).then((res) => res.data);

    const title = product.seoTitle || product.name;
    const description =
      product.seoDescription ||
      product.shortDescription ||
      stripHtml(product.description)?.slice(0, 160);
    const keywords = product.seoKeywords || undefined;
    const canonical = product.canonicalUrl || `${BASE_URL}/${product.slug}`;
    const ogImageUrl = product.ogImage
      ? getImageUrl(product.ogImage)
      : product.images?.[0]?.url
        ? getImageUrl(product.images[0].url)
        : undefined;

    return {
      title,
      description,
      keywords,
      alternates: {
        canonical,
      },
      openGraph: {
        title: `${title} | ${storeName}`,
        description: description || undefined,
        url: canonical,
        siteName: storeName,
        type: "website",
        images: ogImageUrl
          ? [
            {
              url: ogImageUrl,
              width: 800,
              height: 800,
              alt: product.name,
            },
          ]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | ${storeName}`,
        description: description || undefined,
        images: ogImageUrl ? [ogImageUrl] : [],
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    return {
      title: "Sản phẩm không tìm thấy",
      robots: { index: false },
    };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const queryClient = getQueryClient();
  const apiClient = getPublicServerApiClient();

  // Prefetch critical data in parallel
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["product", slug],
      queryFn: () => productApi.getBySlug(slug, { client: apiClient }).then((res) => res.data),
    }),
    queryClient.prefetchQuery({
      queryKey: ["products", { type: "similar", similar_to: slug, limit: 6 }],
      queryFn: () =>
        productApi.getList({ type: "similar", similar_to: slug, limit: 6 }, { client: apiClient }),
    }),
    queryClient.prefetchQuery({
      queryKey: ["products", { limit: 8 }],
      queryFn: () => productApi.getList({ limit: 8 }, { client: apiClient }),
    }),
  ]);

  // Fetch product data for SEO/JsonLd
  let product = null;
  try {
    const res = await productApi.getBySlug(slug, { client: apiClient });
    product = res.data;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn(`[SEO] Backend is offline (${msg}). Skip pre-fetching product for SEO.`);
  }

  return (
    <>
      {product && (
        <JsonLd
          product={product}
          breadcrumbs={[
            { name: "Trang chủ", item: "/" },
            { name: "Sản phẩm", item: "/san-pham" },
            ...(product.categories?.length
              ? [
                {
                  name: product.categories[0].name,
                  item: `/danh-muc/${product.categories[0].slug}`,
                },
              ]
              : []),
            { name: product.name, item: `/${product.slug}` },
          ]}
        />
      )}
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductDetailContent />
      </HydrationBoundary>
    </>
  );
}
