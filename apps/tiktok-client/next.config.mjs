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
  async rewrites() {
    return [
      {
        source: "/danh-muc",
        destination: "/categories",
      },
      {
        source: "/danh-muc/:slug",
        destination: "/category/:slug",
      },
      {
        source: "/san-pham",
        destination: "/products",
      },
    ];
  },
  transpilePackages: ["@vibe/shared"],
};

export default withBundleAnalyzer(nextConfig);
