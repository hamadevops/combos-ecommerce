import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface ProductTabsProps {
  tabs: string[];
  activeTab: number;
  onTabClick: (index: number) => void;
}

export default function ProductTabs({ tabs, activeTab, onTabClick }: ProductTabsProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed top-[53px] w-full max-w-md mx-[auto] left-1/2 -translate-x-1/2 z-40 bg-background border-b border-border transition-all duration-300",
        isScrolled ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none",
      )}
    >
      <div className="flex">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            onClick={() => onTabClick(index)}
            className={cn(
              "flex-1 py-3 text-sm font-medium relative transition-colors",
              activeTab === index ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {tab}
            {activeTab === index && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-foreground rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
