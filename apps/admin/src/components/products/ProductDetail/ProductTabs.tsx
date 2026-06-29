import { cn } from "@/lib/utils";

interface ProductTabsProps {
  tabs: string[];
  activeTab: number;
  onTabClick: (index: number) => void;
}

export default function ProductTabs({ tabs, activeTab, onTabClick }: ProductTabsProps) {
  return (
    <div className="sticky top-[54px] z-40 bg-background border-b border-border">
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
