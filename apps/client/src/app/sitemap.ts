import { MetadataRoute } from "next";
import { getPublicServerApiClient } from "@/lib/server-api-config";
import { productApi } from "@/api/product";
import { categoryApi } from "@/api/category";
import { getImageUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const apiClient = getPublicServerApiClient();

  // Static routes
  const routes = ["", "/san-pham", "/danh-muc"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 1,
  }));

  // Fetch products
  let products: MetadataRoute.Sitemap = [];
  try {
    const productsRes = await productApi.getList({ type: "sitemap" }, { client: apiClient });
    products = productsRes.data.map((product) => ({
      url: `${baseUrl}/${product.slug}`,
      lastModified: new Date(product.updatedAt || new Date()),
      changeFrequency: "weekly" as const,
      priority: 1,
      ...(product.images?.length ? { images: product.images.map((img) => getImageUrl(img.url)??"").slice(0,4) } : {}),
    }));
  } catch (error) {
    console.error("Failed to fetch products for sitemap", error);
  }

  // Fetch categories
  let categories: MetadataRoute.Sitemap = [];
  try {
    const categoriesRes = await categoryApi.getList({ limit: 1000 }, { client: apiClient });
    categories = categoriesRes.data.map((category) => ({
      url: `${baseUrl}/danh-muc/${category.slug}`,
      lastModified: new Date(category.updatedAt || new Date()),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Failed to fetch categories for sitemap", error);
  }

  return [...routes, ...products, ...categories];
}
