import DOMPurify from "dompurify";
import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface HtmlContentProps extends HTMLAttributes<HTMLDivElement> {
  content: string;
  className?: string;
}

export function HtmlContent({ content, className, ...props }: HtmlContentProps) {
  // Basic configuration for sanitization to allow common formatting tags
  // but strip potentially dangerous ones (scripts, iframes, etc.)
  const sanitizedContent = DOMPurify.sanitize(content || "", {
    USE_PROFILES: { html: true },
  });

  if (!content) return null;

  return (
    <div
      className={cn(
        "prose prose-sm max-w-none dark:prose-invert",
        "prose-headings:font-semibold prose-headings:tracking-tight",
        "prose-p:leading-relaxed prose-p:text-muted-foreground",
        "prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline",
        "prose-img:rounded-md prose-img:border prose-img:border-border",
        "text-sm text-foreground", // Default text color
        className,
      )}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      {...props}
    />
  );
}
