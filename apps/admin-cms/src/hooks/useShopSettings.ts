import { useQuery } from "@tanstack/react-query";
import { settingsService } from "@/services/settings.service";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useEffect } from "react";
import { getImageUrl } from "@/lib/utils";

export const useShopSettings = () => {
  const {
    data: settings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["public-settings"],
    queryFn: settingsService.getPublic,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  useEffect(() => {
    if (settings) {
      if (settings.store_name) {
        document.title = settings.store_name;
      }
      
      if (settings.store_logo) {
        let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = getImageUrl(settings.store_logo);
      }
    }
  }, [settings]);

  // Helper to get a specific value safely
  const getSetting = (key: string, defaultValue: any = "") => {
    if (!settings) return defaultValue;
    return settings[key] !== undefined ? settings[key] : defaultValue;
  };

  // Helper for JSON fields
  const getJsonSetting = (key: string, defaultValue: any = []) => {
    const val = getSetting(key, null);
    if (!val) return defaultValue;
    try {
      // If it's already an object/array, return it
      if (typeof val === "object") return val;
      return JSON.parse(val);
    } catch (e) {
      console.error(`Error parsing setting ${key}`, e);
      return defaultValue;
    }
  };

  return {
    settings,
    isLoading,
    error,
    getSetting,
    getJsonSetting,
  };
};
