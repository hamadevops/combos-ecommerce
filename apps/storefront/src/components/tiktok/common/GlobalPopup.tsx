"use client";

import { useEffect, useState } from "react";
import { useActivePopup } from "@/hooks/usePopups";
import { Dialog, DialogContent, DialogTitle } from "@/components/tiktok/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/tiktok/ui/button";
import { getImageUrl } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export function GlobalPopup() {
  const { data: popupResponse, isLoading } = useActivePopup();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Data can be a single object or an array of popups
  const activePopups = Array.isArray(popupResponse)
    ? popupResponse
    : popupResponse
      ? [popupResponse]
      : [];

  // For now, we only show the first center popup as the global center popup
  const activePopup =
    activePopups.find((p: any) => p.position === "center" || p.position === "CENTER") ||
    activePopups[0];

  useEffect(() => {
    if (activePopup) {
      // Check if popup has been dismissed recently (within 15 mins)
      const seenPopup = Cookies.get(`seen_popup_${activePopup.id}`);
      if (!seenPopup) {
        // Short delay for better UX
        const timer = setTimeout(() => setOpen(true), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [activePopup]);

  const handleClose = () => {
    setOpen(false);
    if (activePopup) {
      // Set cookie to expire in 15 minutes (15/1440 of a day)
      const expires = new Date(new Date().getTime() + 15 * 60 * 1000);
      Cookies.set(`seen_popup_${activePopup.id}`, "true", { expires });
    }
  };

  const handleAction = () => {
    if (activePopup?.link) {
      handleClose();
      if (activePopup.link.startsWith("http")) {
        window.open(activePopup.link, "_blank");
      } else {
        router.push(activePopup.link);
      }
    }
  };

  if (isLoading || !activePopup) return null;

  const p = activePopup as any;
  const position = p.position?.toUpperCase();
  const popupImage = p.image_url || p.image;
  const popupName = p.title || p.name;

  if (position === "CENTER") {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-transparent border-none shadow-none [&>button]:hidden">
          <div className="relative bg-background rounded-lg shadow-lg overflow-hidden flex flex-col items-center text-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10 rounded-full bg-black/20 hover:bg-black/40 text-white"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>

            {popupImage && (
              <div className="w-full relative aspect-video">
                <img
                  loading="lazy"
                  decoding="async"
                  src={getImageUrl(popupImage)}
                  alt={popupName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6 space-y-4 w-full bg-white dark:bg-zinc-900">
              <DialogTitle className="sr-only">{popupName || "Popup Notification"}</DialogTitle>
              {(popupName || p.description) && (
                <div className="space-y-2">
                  {popupName && <h2 className="text-xl font-bold">{popupName}</h2>}
                  {p.description && <p className="text-muted-foreground">{p.description}</p>}
                </div>
              )}

              {p.promo_code && (
                <div
                  className="bg-primary/10 border border-primary/20 rounded-md p-3 select-all cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(p.promo_code!);
                    // Could add toast here
                  }}
                >
                  <span className="text-sm font-medium text-primary">Mã giảm giá:</span>
                  <div className="text-lg font-bold text-primary">{p.promo_code}</div>
                </div>
              )}

              {p.link && (
                <Button className="w-full" onClick={handleAction}>
                  Xem ngay
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Handle other positions (FOOTER/SIDEBAR) if needed later
  // For now returning null or simpler banner for FOOTER could be added
  return null;
}
