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
    console.error("Failed to fetch shop settings", error);
    return {
      storeName: "Điện máy chính hãng VN",
      storeDescription: "Điện máy chính hãng VN",
      storeLogo: null,
      storeOgImage: null,
    };
  }
});
