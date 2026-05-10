"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface SearchTriggerProps {
  onClick: () => void;
  placeholder?: string;
  variant?: "default" | "glass";
  className?: string;
}

const TriggerUI = ({
  onClick,
  placeholder = "Tìm kiếm sản phẩm...",
  variant = "default",
  className,
  value,
}: SearchTriggerProps & { value: string }) => (
  <div
    className={cn("flex-1 relative cursor-pointer group", className)}
    onClick={onClick}
    role="button"
    aria-label="Tìm kiếm sản phẩm"
  >
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
    <input
      type="text"
      readOnly
      value={value}
      placeholder={placeholder}
      className={cn(
        "tiktok-search w-full pl-10 pr-4 pointer-events-none text-ellipsis",
        variant === "glass" && "bg-background/80 backdrop-blur-md border border-white/10 shadow-sm",
      )}
    />
  </div>
);

const SearchTriggerContent = (props: SearchTriggerProps) => {
  const searchParams = useSearchParams();
  const searchToken = searchParams?.get("search") || "";

  return <TriggerUI {...props} value={searchToken} />;
};

const SearchTrigger = (props: SearchTriggerProps) => {
  return (
    <Suspense fallback={<TriggerUI {...props} value="" />}>
      <SearchTriggerContent {...props} />
    </Suspense>
  );
};

export default SearchTrigger;
