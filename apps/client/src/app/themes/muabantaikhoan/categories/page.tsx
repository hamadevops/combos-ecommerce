import PageLayout from "@/components/tiktok/layout/PageLayout";
import { getQueryClient } from "@/lib/get-query-client";
import { getPublicServerApiClient } from "@/lib/server-api-config";
import { categoryApi } from "@/api/category";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import CategoryList from "./CategoryList";
import { getShopSettings } from "@/lib/fetch-settings";

// MuaBanTaiKhoan Theme Imports
import DeviceLayoutWrapper from "@/components/muabantaikhoan/layout/DeviceLayoutWrapper";
import MuabanCategoryList from "@/components/muabantaikhoan/features/category/CategoryList";

import { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://phanphoichinhhang.com";

export async function generateMetadata(): Promise<Metadata> {
  const { storeName } = await getShopSettings();

  return {
    title: "Danh mục sản phẩm",
    description: `Khám phá tất cả danh mục sản phẩm tại ${storeName}. Tìm kiếm dụng cụ cơ khí theo danh mục phù hợp.`,
    alternates: {
      canonical: `${BASE_URL}/categories`,
    },
    openGraph: {
      title: `Danh mục sản phẩm | ${storeName}`,
      description: `Khám phá tất cả danh mục sản phẩm tại ${storeName}.`,
      url: `${BASE_URL}/categories`,
      siteName: storeName,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `Danh mục sản phẩm | ${storeName}`,
    },
  };
}

export default async function CategoriesPage() {
  const queryClient = getQueryClient();
  const apiClient = getPublicServerApiClient();

  await queryClient.prefetchQuery({
    queryKey: ["categories", { page: 1, limit: 100 }],
    queryFn: () => categoryApi.getList({ page: 1, limit: 100 }, { client: apiClient }),
  });

  const currentTheme = process.env.NEXT_PUBLIC_THEME || 'tiktok';

  if (currentTheme === 'muabantaikhoan') {
    return (
      <DeviceLayoutWrapper>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <MuabanCategoryList />
        </HydrationBoundary>
      </DeviceLayoutWrapper>
    );
  }

  return (
    <PageLayout headerProps={{ title: "Danh mục", showBack: true, showSearch: false }}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <CategoryList />
      </HydrationBoundary>
    </PageLayout>
  );
}
