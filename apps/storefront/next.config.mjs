import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  distDir: "../../dist/apps/tiktok-client/.next",
  images: {
    remotePatterns: (() => {
      const patterns = [
        {
          hostname: "images.unsplash.com",
        },
        {
          hostname: "placehold.co",
        },
        {
          hostname: "github.com",
        },
      ];

      // Auto-whitelist domain from NEXT_PUBLIC_API_IMAGE_URL
      const apiImageUrl = process.env.NEXT_PUBLIC_API_IMAGE_URL;
      if (apiImageUrl) {
        try {
          const url = new URL(apiImageUrl);
          patterns.push({
            protocol: url.protocol.replace(":", ""),
            hostname: url.hostname,
            port: url.port || undefined,
          });
        } catch (e) {
          // Ignore invalid URL
        }
      }

      // Add user-defined hostname images (handles hosts with port correctly, e.g. localhost:9000)
      if (process.env.NEXT_PUBLIC_HOSTNAME_IMAGE) {
        process.env.NEXT_PUBLIC_HOSTNAME_IMAGE.split(",")
          .filter(Boolean)
          .forEach((i) => {
            const trimmed = i.trim();
            if (trimmed.includes(":")) {
              const [hostname, port] = trimmed.split(":");
              patterns.push({ hostname, port });
            } else {
              patterns.push({ hostname: trimmed });
            }
          });
      }

      return patterns;
    })(),
  },
  // Path aliases (e.g. /danh-muc → /categories) are handled in middleware (src/proxy.ts)
  // because middleware runs before next.config.mjs rewrites and prepends the theme prefix.
  transpilePackages: ["@vibe/shared"],
};

export default withBundleAnalyzer(nextConfig);
