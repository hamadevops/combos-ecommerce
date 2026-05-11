import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Search, Mail, UserPlus } from "lucide-react";
import { useEmContacts, useAssignContactsToSegment } from "@/hooks/useEmailMarketing";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface AddContactsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  segmentId: number;
  existingContactIds?: number[];
}

export function AddContactsDialog({
  open,
  onOpenChange,
  segmentId,
  existingContactIds = [],
}: AddContactsDialogProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const { data } = useEmContacts({
    page,
    limit: 10,
    search: search || undefined,
    enabled: open,
  });
  const meta = data?.meta;
  const assignContacts = useAssignContactsToSegment(segmentId);

  const allContacts = data?.items || [];
  const availableContacts = allContacts.filter((c: any) => !existingContactIds.includes(c.id));

  const toggleContact = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const allSelected =
    availableContacts.length > 0 && availableContacts.every((c) => selected.includes(c.id));

  const handleSelectAll = () => {
    if (allSelected) {
      const availableIds = availableContacts.map((c) => c.id);
      setSelected((prev) => prev.filter((id) => !availableIds.includes(id)));
    } else {
      const availableIds = availableContacts.map((c) => c.id);
      setSelected((prev) => Array.from(new Set([...prev, ...availableIds])));
    }
  };

  const handleAssign = () => {
    if (selected.length === 0) return;
    assignContacts.mutate(selected, {
      onSuccess: () => {
        setSelected([]);
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 bg-slate-50/50 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Thêm contacts vào segment</DialogTitle>
              <DialogDescription className="text-sm">
                Tìm kiếm và chọn các contacts muốn thêm vào phân khúc này.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0 bg-white">
          <div className="p-6 pb-2">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Tìm kiếm theo email, tên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl"
              />
            </div>
          </div>

          <div className="px-6 py-2 border-y bg-slate-50/30 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              {availableContacts.length} contacts tìm thấy
            </span>
            {availableContacts.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] font-semibold text-primary hover:text-primary/80 hover:bg-primary/5 rounded-lg px-2"
                onClick={handleSelectAll}
              >
                {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả trang này"}
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-2">
            {availableContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in zoom-in duration-300">
                <div className="p-4 bg-slate-50 rounded-full mb-4">
                  <Search className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="font-semibold text-slate-900">Không tìm thấy contact</h3>
                <p className="text-sm text-slate-500 max-w-[250px] mt-1">
                  Thử tìm kiếm với từ khóa khác hoặc kiểm tra lại danh sách contacts của bạn.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {availableContacts.map((contact: any) => {
                  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(" ");
                  const initials = (fullName || contact.email || "?")
                    .split(/[ @._-]/)
                    .filter(Boolean)
                    .map((s) => s[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <div
                      key={contact.id}
                      className={cn(
                        "group flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all hover:bg-slate-50 active:scale-[0.99]",
                        selected.includes(contact.id) ? "bg-primary/5 ring-1 ring-primary/20" : "",
                      )}
                      onClick={() => toggleContact(contact.id)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative">
                          <Checkbox
                            checked={selected.includes(contact.id)}
                            onCheckedChange={() => toggleContact(contact.id)}
                            className="absolute -left-1 -top-1 opacity-0 group-hover:opacity-100 data-[state=checked]:opacity-100 transition-opacity z-10"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Avatar className="h-10 w-10 border border-slate-200">
                            <AvatarFallback className="bg-slate-100 text-slate-600 font-medium text-xs">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                            {contact.email}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {fullName || "Chưa có tên"}
                          </span>
                        </div>
                      </div>
                      <div className="hidden sm:block">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-normal py-0 px-2 h-5 bg-white"
                        >
                          <Mail className="h-3 w-3 mr-1 opacity-50" />
                          Contact
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="px-6 py-3 border-t bg-slate-50/30">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage(Math.max(1, page - 1))}
                      className={
                        page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer scale-75"
                      }
                    />
                  </PaginationItem>
                  <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                    Trang {page} / {meta.totalPages}
                  </div>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage(Math.min(meta.totalPages, page + 1))}
                      className={
                        page >= meta.totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer scale-75"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 bg-slate-50/50 border-t flex flex-row items-center justify-between sm:justify-between">
          <div className="text-sm text-muted-foreground font-medium">
            {selected.length > 0 ? (
              <span className="text-primary flex items-center gap-1.5 animate-in slide-in-from-left-2 duration-300">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Đã chọn {selected.length} contacts
              </span>
            ) : (
              "Chọn ít nhất 1 contact"
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl px-6">
              Hủy
            </Button>
            <Button
              onClick={handleAssign}
              disabled={selected.length === 0 || assignContacts.isPending}
              className="rounded-xl px-6 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
            >
              {assignContacts.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              Xác nhận thêm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
