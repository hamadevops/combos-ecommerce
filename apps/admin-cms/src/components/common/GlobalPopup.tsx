import { useEffect, useState } from "react";
import { useActivePopup } from "@/hooks/usePopups";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/lib/utils";
import { PopupPosition } from "@/types/popup";
import { useNavigate } from "react-router-dom";

export function GlobalPopup() {
  const { data: popup, isLoading } = useActivePopup();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (popup) {
      // Check if popup has been seen in this session
      const seenPopup = sessionStorage.getItem(`seen_popup_${popup.id}`);
      if (!seenPopup) {
        // Short delay for better UX
        const timer = setTimeout(() => setOpen(true), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [popup]);

  const handleClose = () => {
    setOpen(false);
    if (popup) {
      sessionStorage.setItem(`seen_popup_${popup.id}`, "true");
    }
  };

  const handleAction = () => {
    if (popup?.link) {
      handleClose();
      if (popup.link.startsWith("http")) {
        window.open(popup.link, "_blank");
      } else {
        navigate(popup.link);
      }
    }
  };

  if (isLoading || !popup) return null;

  if (popup.position === PopupPosition.CENTER) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-transparent border-none shadow-none">
          <div className="relative bg-background rounded-lg shadow-lg overflow-hidden flex flex-col items-center text-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10 rounded-full bg-black/20 hover:bg-black/40 text-white"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>

            {popup.image_url && (
              <div className="w-full relative aspect-[4/3]">
                <img
                  src={getImageUrl(popup.image_url)}
                  alt={popup.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6 space-y-4 w-full bg-white dark:bg-zinc-900">
              {(popup.title || popup.description) && (
                <div className="space-y-2">
                  {popup.title && <h2 className="text-xl font-bold">{popup.title}</h2>}
                  {popup.description && (
                    <p className="text-muted-foreground">{popup.description}</p>
                  )}
                </div>
              )}

              {popup.promo_code && (
                <div
                  className="bg-primary/10 border border-primary/20 rounded-md p-3 select-all cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(popup.promo_code!);
                    // Could add toast here
                  }}
                >
                  <span className="text-sm font-medium text-primary">Mã giảm giá:</span>
                  <div className="text-lg font-bold text-primary">{popup.promo_code}</div>
                </div>
              )}

              {popup.link && (
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
