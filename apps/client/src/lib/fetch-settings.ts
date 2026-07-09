import { cache } from "react";
import { settingsService } from "@/services/settings.service";
import { getPublicServerApiClient } from "@/lib/server-api-config";

export const getShopSettings = cache(async () => {
  try {
    const client = getPublicServerApiClient();
    const settings = await settingsService.getPublic({ client });
    return {
      storeName: settings?.store_name || "Dealora - Deal hời giá tốt",
      storeDescription: settings?.store_description || "Dealora là nền tảng khám phá sản phẩm và tổng hợp ưu đãi thông minh, giúp bạn dễ dàng tìm thấy những món đồ đáng mua nhất từ nhiều thương hiệu uy tín.",
      storeLogo: settings?.store_logo || null,
      storeOgImage: settings?.store_og_image || settings?.store_background || settings?.store_logo || null,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn(`[Settings] Backend is offline (${msg}). Using fallback shop settings.`);
    return {
      storeName: "Dealora - Deal hời giá tốt",
      storeDescription: "Dealora là nền tảng khám phá sản phẩm và tổng hợp ưu đãi thông minh, giúp bạn dễ dàng tìm thấy những món đồ đáng mua nhất từ nhiều thương hiệu uy tín.",
      storeLogo: null,
      storeOgImage: null,
    };
  }
});
