import { cache } from "react";
import { settingsService } from "@/services/settings.service";
import { getPublicServerApiClient } from "@/lib/server-api-config";

export const getShopSettings = cache(async () => {
  try {
    const client = getPublicServerApiClient();
    const settings = await settingsService.getPublic({ client });
    return {
      storeName: settings?.store_name || "Điện máy chính hãng VN",
      storeDescription: settings?.store_description || "Điện máy chính hãng VN",
      storeLogo: settings?.store_logo || null,
      storeOgImage: settings?.store_og_image || settings?.store_background || settings?.store_logo || null,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn(`[Settings] Backend is offline (${msg}). Using fallback shop settings.`);
    return {
      storeName: "Điện máy chính hãng VN",
      storeDescription: "Điện máy chính hãng VN",
      storeLogo: null,
      storeOgImage: null,
    };
  }
});
