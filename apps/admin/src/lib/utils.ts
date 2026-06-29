import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(path: string | null | undefined | Record<string, any>): string {
  if (!path) return "";

  // Defensive: if path is an object (e.g. API returned { url, filePath, ... }), extract the string
  if (typeof path === "object" && path !== null) {
    const extracted = (path as any).url || (path as any).path || (path as any).filePath || (path as any).filename;
    if (typeof extracted === "string") {
      return getImageUrl(extracted);
    }
    return "";
  }

  // Ensure path is a string
  if (typeof path !== "string") return "";

  if (path.startsWith("http") || path.startsWith("blob:")) return path;

  const baseUrl = import.meta.env.VITE_API_IMAGE_URL || "http://localhost:9000";
  const cleanBase = baseUrl.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${cleanBase}${cleanPath}`;
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

import { format } from "date-fns";

export function formatDate(
  date: string | Date | undefined | null,
  formatStr: string = "dd/MM/yyyy HH:mm:ss",
): string {
  if (!date) return "-";
  try {
    return format(new Date(date), formatStr);
  } catch (error) {
    return "-";
  }
}

// Helper to generate a slug from text
export function generateId(text: string): string {
  return generateSlug(text);
}

export function formatMarkdown(content: string): string {
  if (!content) return "";

  let html = content;

  // Headers with Auto-IDs
  // Updated to allow leading whitespace to match extractTableOfContents logic
  html = html.replace(/^\s*(#{2,3})\s*(.+?)\s+\{#(.+?)\}\s*$/gm, (match, hashes, title, id) => {
    const level = hashes.length;
    return `<h${level} id="${id}">${title.trim()}</h${level}>`;
  });
  html = html.replace(/^\s*(#{2,3})\s*(.+?)\s*$/gm, (match, hashes, title) => {
    const level = hashes.length;
    // Exclude ## followed by # (e.g. ###)
    // Actually regex `#{2,3}` already defines greedy match?
    // usage of (match, hashes...) works.
    const id = generateId(title);
    return `<h${level} id="${id}">${title.trim()}</h${level}>`;
  });

  // Inject IDs into existing HTML H2 tags if missing
  html = html.replace(/<h2\b([^>]*)>(.*?)<\/h2>/gi, (match, attrs, content) => {
    // Check if ID exists in attrs
    if (/id=["']/.test(attrs)) {
      return match; // Already has ID, leave it
    }
    const title = content.replace(/<[^>]+>/g, "").trim();
    const id = generateId(title);
    // Inject ID. attrs might be empty or start with space.
    return `<h2 id="${id}"${attrs}>${content}</h2>`;
  });

  // Lists
  // Process Ordered Lists
  html = html.replace(/(\n|^)(\d+\..+(?:\n\d+\..+)*)/g, (match, prefix, list) => {
    const items = list.replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>");
    return `${prefix}<ol>${items}</ol>`;
  });

  // Process Unordered Lists
  html = html.replace(/(\n|^)(-\s.+(?:\n-\s.+)*)/g, (match, prefix, list) => {
    const items = list.replace(/^-\s+(.+)$/gm, "<li>$1</li>");
    return `${prefix}<ul>${items}</ul>`;
  });

  // Other Formatting
  html = html
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") // Bold
    .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" />') // Images
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>') // Links
    .replace(/^>\s+(.+)$/gm, "<blockquote>$1</blockquote>") // Blockquotes
    .replace(/`([^`]+)`/g, "<code>$1</code>"); // Inline Code

  // Paragraphs
  const blocks = html.split(/\n\n+/);
  const formattedBlocks = blocks.map((block) => {
    const trimmed = block.trim();
    if (!trimmed) return "";
    // If starts with <, assume it's already an element (h, ul, ol, blockquote)
    if (trimmed.match(/^<(h\d|ul|ol|blockquote|img)/)) {
      return trimmed;
    }
    return `<p>${trimmed}</p>`;
  });

  return formattedBlocks.join("");
}

export function extractTableOfContents(content: string) {
  if (!content) return [];

  // Split by newline, explicitly handling CR/LF
  const lines = content.split(/\r?\n/);
  const toc = [];
  for (const line of lines) {
    // MATCH MARKDOWN: ## Header (H2 only)
    // ^\s* allows leading whitespace
    // (#{2})(?!#) ensures exactly 2 hash marks (not 3)
    // \s* matches optional space after hashes
    // (.+?) captures title
    // (?:\s+\{#(.+?)\})? matches optional explicit ID syntax
    const mdMatch = line.match(/^\s*(#{2})(?!#)\s*(.+?)(?:\s+\{#(.+?)\})?\s*$/);
    if (mdMatch) {
      const title = mdMatch[2].trim();
      const explicitId = mdMatch[3];
      const id = explicitId || generateId(title);

      toc.push({ id, title, level: 2 });
      continue;
    }

    // MATCH HTML: <h2>Header</h2>
    // Use global regex to find all H2s in the line (handles minified/compact HTML)
    const htmlRegex = /<h2\b([^>]*)>(.*?)<\/h2>/gi;
    let htmlMatch;
    while ((htmlMatch = htmlRegex.exec(line)) !== null) {
      const attributes = htmlMatch[1];
      const content = htmlMatch[2];

      // Try to extract ID from attributes
      const idMatch = attributes.match(/id=["']([^"']*)["']/i);
      const explicitId = idMatch ? idMatch[1] : null;

      const title = content.replace(/<[^>]+>/g, "").trim(); // strip internal tags
      // Avoid empty titles
      if (!title) continue;

      const id = explicitId || generateId(title);

      toc.push({ id, title, level: 2 });
    }
  }
  return toc;
}

// Format number as VND currency
export function formatPrice(price: number | undefined | null): string {
  if (price === undefined || price === null) return "0₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  })
    .format(price)
    .replace("₫", "đ"); // Replace standard symbol with common usage
}

export function formatSoldCount(count: number | undefined): string {
  if (!count) return "0";
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + "k";
  }
  return count.toString();
}

/**
 * Generates a unique SKU based on product info and attributes.
 * Format: BASE-ATTR1-ATTR2-RAND
 */
export function generateUniqueSku(
  base: string,
  attributes: string[],
  existingSkus: string[] = [],
): string {
  // 1. Clean Base (remove spaces, special chars, uppercase)
  const cleanBase = (base || "SKU")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .substring(0, 10);

  // 2. Clean Attributes (take first 3 chars)
  const cleanAttrs = attributes
    .map((a) =>
      a
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .substring(0, 3),
    )
    .join("-");

  // 3. Generate Basic SKU
  let prefix = cleanBase;
  if (cleanAttrs) {
    prefix += `-${cleanAttrs}`;
  }

  // 4. Ensure Uniqueness with Random Suffix
  let finalSku = "";
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    finalSku = `${prefix}-${randomSuffix}`;

    if (!existingSkus.includes(finalSku)) {
      isUnique = true;
    }
    attempts++;
  }

  // Fallback if random fails (unlikely)
  if (!isUnique) {
    finalSku = `${prefix}-${Date.now().toString(36).toUpperCase()}`;
  }

  return finalSku;
}
