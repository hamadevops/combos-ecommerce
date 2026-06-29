import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
export const dynamic = "force-dynamic";
import "./globals.css";
import { Providers } from "./providers";
import { getQueryClient } from "@/lib/get-query-client";
import { getServerApiClient, getPublicServerApiClient } from "@/lib/server-api-config";
import { settingsService } from "@/services/settings.service";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { GoogleAnalytics } from "@next/third-parties/google";
import FacebookPixel from "@/components/tiktok/common/FacebookPixel";
import JsonLd from "@/components/tiktok/common/JsonLd";

const font = Plus_Jakarta_Sans({ subsets: ["latin", "vietnamese"] });

import { getShopSettings } from "@/lib/fetch-settings";
import { getImageUrl } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { storeName, storeDescription, storeOgImage } = await getShopSettings();

  const ogImageUrl = storeOgImage ? getImageUrl(storeOgImage) : "/android-icon-192x192.png";
  const ogImages = [{ url: ogImageUrl as string }];

  return {
    title: {
      template: `%s | ${storeName}`,
      default: storeName,
    },
    description: storeDescription,
    metadataBase: new URL(String(process.env.NEXT_PUBLIC_TIMESTAMP_URL)),
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      siteName: storeName,
      locale: "vi_VN",
      type: "website",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
    },
    icons: {
      icon: [
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
        { url: "/favicon.ico" },
      ],
      apple: [
        { url: "/apple-icon-57x57.png", sizes: "57x57", type: "image/png" },
        { url: "/apple-icon-60x60.png", sizes: "60x60", type: "image/png" },
        { url: "/apple-icon-72x72.png", sizes: "72x72", type: "image/png" },
        { url: "/apple-icon-76x76.png", sizes: "76x76", type: "image/png" },
        { url: "/apple-icon-114x114.png", sizes: "114x114", type: "image/png" },
        { url: "/apple-icon-120x120.png", sizes: "120x120", type: "image/png" },
        { url: "/apple-icon-144x144.png", sizes: "144x144", type: "image/png" },
        { url: "/apple-icon-152x152.png", sizes: "152x152", type: "image/png" },
        { url: "/apple-icon-180x180.png", sizes: "180x180", type: "image/png" },
      ],
      other: [
        {
          rel: "apple-touch-icon-precomposed",
          url: "/apple-icon-precomposed.png",
        },
      ],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = getQueryClient();
  const apiClient = getPublicServerApiClient();

  // Prefetch global data for all pages
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["public-settings"],
      queryFn: () => settingsService.getPublic({ client: apiClient }),
      staleTime: 60000,
    }),
  ]);

  // Fetch settings for Organization JSON-LD
  let settings: Record<string, any> = {};
  try {
    settings = await settingsService.getPublic({ client: apiClient });
  } catch (e) { }

  // Build social links array
  const socials = [
    settings.social_facebook,
    settings.social_instagram,
    settings.social_tiktok,
    settings.social_zalo,
  ].filter(Boolean);

  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={font.className}>
        <JsonLd
          organization={{
            name: settings.store_name || "Điện máy chính hãng VN",
            description: settings.store_description,
            logo: settings.store_logo,
            url: process.env.NEXT_PUBLIC_TIMESTAMP_URL,
            email: settings.contact_email,
            phone: settings.contact_phone,
            address: settings.contact_address,
            socials,
          }}
        />
        <Providers>
          <HydrationBoundary state={dehydrate(queryClient)}>
            <main className="flex-1">{children}</main>
          </HydrationBoundary>
        </Providers>
        <FacebookPixel />
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
    </html>
  );
}
