import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const utmSource = searchParams.get("utm_source");
  const utmMedium = searchParams.get("utm_medium");
  const utmCampaign = searchParams.get("utm_campaign");
  const utmTerm = searchParams.get("utm_term");
  const utmContent = searchParams.get("utm_content");

  // Marketing Platform tracking
  let marketingPlatform = searchParams.get("platform");
  let marketingPlatformId = null;

  // Infer platform from click IDs
  if (searchParams.get("fbclid")) {
    marketingPlatform = marketingPlatform || "Facebook";
    marketingPlatformId = searchParams.get("fbclid");
  } else if (searchParams.get("gclid")) {
    marketingPlatform = marketingPlatform || "Google";
    marketingPlatformId = searchParams.get("gclid");
  } else if (searchParams.get("ttclid")) {
    marketingPlatform = marketingPlatform || "TikTok";
    marketingPlatformId = searchParams.get("ttclid");
  } else if (searchParams.get("click_id") || searchParams.get("clickId")) {
    marketingPlatformId = searchParams.get("click_id") || searchParams.get("clickId");
  }

  // Create an object to store only defined values
  const marketingData: Record<string, string> = {};
  if (utmSource) marketingData.utmSource = utmSource;
  if (utmMedium) marketingData.utmMedium = utmMedium;
  if (utmCampaign) marketingData.utmCampaign = utmCampaign;
  if (utmTerm) marketingData.utmTerm = utmTerm;
  if (utmContent) marketingData.utmContent = utmContent;
  if (marketingPlatform) marketingData.marketingPlatform = marketingPlatform;
  if (marketingPlatformId) marketingData.marketingPlatformId = marketingPlatformId;

  // Vietnamese path aliases → actual filesystem route directories
  // These must be resolved here (not in next.config.mjs rewrites) because
  // middleware runs before next.config.mjs rewrites and prepends the theme prefix.
  let pathname = request.nextUrl.pathname;

  if (pathname === "/danh-muc") {
    pathname = "/categories";
  } else if (pathname.startsWith("/danh-muc/")) {
    pathname = "/category/" + pathname.slice("/danh-muc/".length);
  } else if (pathname === "/san-pham") {
    pathname = "/products";
  }

  const theme = process.env.NEXT_PUBLIC_THEME || "tiktok";
  const rewriteUrl = new URL(`/themes/${theme}${pathname}${request.nextUrl.search}`, request.url);
  const response = NextResponse.rewrite(rewriteUrl);

  // Set individual cookies for any present marketing parameter
  Object.entries(marketingData).forEach(([key, value]) => {
    response.cookies.set({
      name: key,
      value: value,
      maxAge: 15 * 24 * 60 * 60, // 15 days in seconds
      path: "/",
      httpOnly: false, // Must be readable from the client JS side for the checkout form
    });
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt, manifest.webmanifest, manifest.json (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest\\.webmanifest|manifest\\.json|.*\\.(?:ico|png|jpg|jpeg|svg|webp)$).*)",
  ],
};
