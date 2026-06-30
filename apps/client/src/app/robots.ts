import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    rules: [
      {
        // Nhóm 1: Dành cho các Bot tìm kiếm hợp lệ (Googlebot, Bingbot...)
        userAgent: "*",
        allow: "/",
        disallow: ["/profile/", "/cart/", "/orders/"],
      },
      {
        // Nhóm 2: Chặn hoàn toàn các Bot SEO đối thủ và Bot cào dữ liệu AI
        userAgent: [
          // --- Các công cụ soi dữ liệu SEO thương mại ---
          "AhrefsBot",
          "SemrushBot",
          "DotBot",
          "MJ12bot",
          "PetalBot",
          "BLEXBot",
          "MegaIndex.ru",
          "Barkrowler",
          
          // --- Các Bot thu thập dữ liệu huấn luyện AI ---
          "GPTBot",             // OpenAI (ChatGPT)
          "ChatGPT-User",       // OpenAI (Plugins)
          "ClaudeBot",          // Anthropic (Claude)
          "anthropic-ai",       // Anthropic
          "Bytespider",         // ByteDance (TikTok AI)
          "Google-Extended",    // Google AI (Gemini) - Rất quan trọng, KHÔNG ảnh hưởng SEO
          "CCBot",              // Common Crawl (Nguồn cấp data lớn nhất cho mọi AI)
          "Applebot-Extended",  // Apple Intelligence
          "Amazonbot",          // Amazon Web Services Scraping
          "PerplexityBot",      // Perplexity AI
        ],
        disallow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}