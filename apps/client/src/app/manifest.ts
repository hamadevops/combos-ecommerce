import { MetadataRoute } from "next";
import { getShopSettings } from "@/lib/fetch-settings";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { storeName, storeDescription } = await getShopSettings();

  return {
    name: storeName || "Dealora - Deal hời giá tốt",
    short_name: storeName || "Dealora",
    description: storeDescription || "Dealora là nền tảng khám phá sản phẩm và tổng hợp ưu đãi thông minh, giúp bạn dễ dàng tìm thấy những món đồ đáng mua nhất từ nhiều thương hiệu uy tín.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/android-icon-36x36.png",
        sizes: "36x36",
        type: "image/png",
      },
      {
        src: "/android-icon-48x48.png",
        sizes: "48x48",
        type: "image/png",
      },
      {
        src: "/android-icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
      },
      {
        src: "/android-icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: "/android-icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
      },
      {
        src: "/android-icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  };
}
