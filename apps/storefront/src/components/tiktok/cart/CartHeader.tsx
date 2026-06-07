"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface CartHeaderProps {
  itemCount: number;
  isEditMode: boolean;
  onToggleEditMode: () => void;
}

export default function CartHeader({ itemCount, isEditMode, onToggleEditMode }: CartHeaderProps) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-50 bg-background flex items-center justify-between px-3 py-3 border-b border-white/10">
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (window.history.length > 2) {
              router.back();
            } else {
              router.push("/");
            }
          }}
          className="p-1 hover:bg-white/10 rounded-full"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Giỏ hàng ({itemCount})</h1>
      </div>
      <button onClick={onToggleEditMode} className="text-base text-foreground font-medium px-2">
        {isEditMode ? "Hoàn tất" : "Sửa"}
      </button>
    </div>
  );
}
