import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: "../../dist/apps/tiktok-client/.next",
  images: {
    remotePatterns: [
      {
        hostname: "images.unsplash.com",
      },
      {
        hostname: "placehold.co",
      },
      {
        hostname: "github.com",
      },
      ...(process.env.NEXT_PUBLIC_HOSTNAME_IMAGE || "")
        .split(",")
        .filter(Boolean)
        .map((i) => ({
          hostname: i.trim(),
        })),
    ],
  },
  // Path aliases (e.g. /danh-muc → /categories) are handled in middleware (src/proxy.ts)
  // because middleware runs before next.config.mjs rewrites and prepends the theme prefix.
  transpilePackages: ["@vibe/shared"],
};

export default withBundleAnalyzer(nextConfig);
