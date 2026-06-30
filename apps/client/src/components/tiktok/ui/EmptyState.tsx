"use client";

import React from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  icon = <Inbox className="w-10 h-10 text-zinc-400 dark:text-zinc-600 stroke-[1.5]" />,
  title = "Trống",
  description = "Chưa có dữ liệu hiển thị",
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 py-16 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30 backdrop-blur-sm animate-fade-in",
        className
      )}
    >
      {/* Icon Wrapper */}
      <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4 ring-8 ring-zinc-50 dark:ring-zinc-950/50">
        {icon}
      </div>

      {/* Text Info */}
      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">
        {title}
      </h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[240px] leading-relaxed">
        {description}
      </p>

      {/* Action Button */}
      {action && <div className="mt-5 w-full">{action}</div>}
    </div>
  );
}
