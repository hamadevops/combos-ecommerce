"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/tiktok/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  // To avoid hydration mismatch
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className={className} aria-label="Thay đổi giao diện">
        <div className="h-5 w-5 opacity-0" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn("relative", className)}
      aria-label="Thay đổi giao diện"
    >
      <Sun className="h-5 w-5 transition-all dark:-rotate-90 dark:opacity-0" />
      <Moon className="absolute h-5 w-5 rotate-90 opacity-0 transition-all dark:rotate-0 dark:opacity-100" />
    </Button>
  );
}
