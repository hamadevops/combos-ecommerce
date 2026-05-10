"use client";

import DOMPurify from "dompurify";
import { cn } from "@/lib/utils";
import { HTMLAttributes, useEffect, useState } from "react";

interface HtmlContentProps extends HTMLAttributes<HTMLDivElement> {
  content: string;
  className?: string;
}

export function HtmlContent({ content, className, ...props }: HtmlContentProps) {
  const [sanitizedContent, setSanitizedContent] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (content) {
      setSanitizedContent(
        DOMPurify.sanitize(content, {
          USE_PROFILES: { html: true },
        }),
      );
    }
  }, [content]);

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
      dangerouslySetInnerHTML={{ __html: isMounted ? sanitizedContent : content }}
      {...props}
    />
  );
}
