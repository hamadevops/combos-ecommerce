import { getQueryClient } from "@/lib/get-query-client";
import { getPublicServerApiClient } from "@/lib/server-api-config";
import { pageApi } from "@/api/page";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import PageDetailContent from "./PageDetailContent";
import { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const apiClient = getPublicServerApiClient();

  try {
    const response = await pageApi.getOne(slug, { client: apiClient });
    const page = response.data;
    return {
      title: page.metaTitle || page.title,
      description: page.metaDescription || undefined,
      keywords: page.metaKeywords || undefined,
    };
  } catch (error) {
    return {
      title: "Trang không tìm thấy",
      robots: { index: false },
    };
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const queryClient = getQueryClient();
  const apiClient = getPublicServerApiClient();

  await queryClient.prefetchQuery({
    queryKey: ["page", slug],
    queryFn: () => pageApi.getOne(slug, { client: apiClient }).then((res) => res.data),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageDetailContent slug={slug} />
    </HydrationBoundary>
  );
}
