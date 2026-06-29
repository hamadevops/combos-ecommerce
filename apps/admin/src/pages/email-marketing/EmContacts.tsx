import { useState, useRef } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useEmContacts,
  useCreateEmContact,
  useUpdateEmContact,
  useDeleteEmContact,
  useImportEmContacts,
  useEmSegments,
} from "@/hooks/useEmailMarketing";
import type { CreateEmContactDto, UpdateEmContactDto } from "@projects/shared";
import { Plus, Upload, Edit, Trash2, Search, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

export default function EmContacts() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<string>("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const limit = 20;
  const { data, isLoading } = useEmContacts({
    page,
    limit,
    search: search || undefined,
    segmentId: segmentFilter ? Number(segmentFilter) : undefined,
  });
  const { data: segments } = useEmSegments();
  const createContact = useCreateEmContact();
  const deleteContact = useDeleteEmContact();
  const importContacts = useImportEmContacts();

  const contacts = data?.items || [];
  const meta = data?.meta;

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleOpenCreate = () => {
    setEditingContact(null);
    setSheetOpen(true);
  };

  const handleOpenEdit = (contact: any) => {
    setEditingContact(contact);
    setSheetOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteContact.mutate(id);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      toast.error("Chỉ chấp nhận file CSV");
      return;
    }
    importContacts.mutate(file, {
      onSuccess: () => {
        setImportDialogOpen(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
    });
  };

  const segmentList = segments?.items || [];

  return (
    <AdminLayout title="Quản lý Contacts">
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Danh bạ Email
              </CardTitle>
              <CardDescription>
                Quản lý danh sách người nhận email. Tổng: {meta?.total || 0} contacts
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setImportDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-1" />
                Import CSV
              </Button>
              <Button
                size="sm"
                onClick={handleOpenCreate}
                className="bg-primary hover:bg-primary/90 shadow-sm"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Thêm liên hệ
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex gap-2 flex-1">
                <Input
                  placeholder="Tìm theo email, tên, công ty..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="max-w-sm"
                />
                <Button variant="outline" size="icon" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <Select
                value={segmentFilter}
                onValueChange={(val) => {
                  setSegmentFilter(val === "all" ? "" : val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Lọc theo segment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả segments</SelectItem>
                  {segmentList.map((seg: any) => (
                    <SelectItem key={seg.id} value={String(seg.id)}>
                      {seg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Tên</TableHead>
                    <TableHead className="hidden md:table-cell">Công ty</TableHead>
                    <TableHead className="hidden lg:table-cell">Segments</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={6}>
                          <Skeleton className="h-8 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : contacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Chưa có contact nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    contacts.map((contact: any) => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">{contact.email}</TableCell>
                        <TableCell>
                          {[contact.firstName, contact.lastName].filter(Boolean).join(" ") || "—"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {contact.company || "—"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {contact.segments?.map((seg: any) => (
                              <Badge key={seg.id} variant="secondary" className="text-xs">
                                {seg.name}
                              </Badge>
                            )) || "—"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={contact.isSubscribed ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {contact.isSubscribed ? "Đang theo dõi" : "Đã hủy"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(contact)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <ConfirmDialog
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive/90"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              }
                              title="Xóa liên hệ?"
                              description={`Bạn có chắc chắn muốn xóa liên hệ "${contact.email}"?`}
                              onConfirm={() => handleDelete(contact.id)}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage(Math.max(1, page - 1))}
                        className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {[...Array(Math.min(meta.totalPages, 5))].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            isActive={pageNum === page}
                            onClick={() => setPage(pageNum)}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage(Math.min(meta.totalPages, page + 1))}
                        className={
                          page >= meta.totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent className="overflow-y-auto sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>{editingContact ? "Chỉnh sửa Contact" : "Thêm Contact mới"}</SheetTitle>
              <SheetDescription>
                {editingContact
                  ? "Cập nhật thông tin contact"
                  : "Nhập thông tin để tạo contact mới"}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <ContactForm initialData={editingContact} onClose={() => setSheetOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        {/* Import CSV Dialog */}
        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Contacts từ CSV</DialogTitle>
              <DialogDescription>
                File CSV cần có header: email, firstname, lastname, phone, company
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="csv-file">Chọn file CSV</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={handleImportFile}
                />
              </div>
              <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md font-mono">
                email,firstname,lastname,phone,company
                <br />
                john@test.com,John,Doe,0909090909,Acme Corp
                <br />
                jane@test.com,Jane,Smith,,
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

// ─── Contact Form Component ─────────────────────────────────────────────────────

function ContactForm({ initialData, onClose }: { initialData?: any; onClose: () => void }) {
  const [email, setEmail] = useState(initialData?.email || "");
  const [firstName, setFirstName] = useState(initialData?.firstName || "");
  const [lastName, setLastName] = useState(initialData?.lastName || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [company, setCompany] = useState(initialData?.company || "");
  const [isSubscribed, setIsSubscribed] = useState(initialData?.isSubscribed ?? true);

  const createContact = useCreateEmContact();
  const updateContact = useUpdateEmContact(initialData?.id || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Email là bắt buộc");
      return;
    }

    const data = {
      email,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      phone: phone || undefined,
      company: company || undefined,
      isSubscribed,
    };

    if (initialData) {
      updateContact.mutate(data, {
        onSuccess: () => {
          onClose();
          toast.success("Cập nhật liên hệ thành công");
        },
      });
    } else {
      createContact.mutate(data, {
        onSuccess: () => {
          onClose();
          toast.success("Đã thêm liên hệ vào danh bạ");
        },
        onError: (err: any) => {
          const detail = err?.response?.data?.message || err?.message;
          if (detail?.includes("unique") || detail?.includes("exists")) {
            toast.error("Email này đã tồn tại trong hệ thống");
          } else {
            toast.error(detail || "Không thể tạo liên hệ");
          }
        },
      });
    }
  };

  const isPending = createContact.isPending || updateContact.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="contact-email">Email *</Label>
        <Input
          id="contact-email"
          type="email"
          placeholder="john@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="contact-firstName">Tên</Label>
          <Input
            id="contact-firstName"
            placeholder="John"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-lastName">Họ</Label>
          <Input
            id="contact-lastName"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-phone">Số điện thoại</Label>
        <Input
          id="contact-phone"
          placeholder="0909090909"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-company">Công ty</Label>
        <Input
          id="contact-company"
          placeholder="Acme Corp"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-3">
        <Switch id="contact-subscribed" checked={isSubscribed} onCheckedChange={setIsSubscribed} />
        <Label htmlFor="contact-subscribed">Đang theo dõi (subscribed)</Label>
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Hủy
        </Button>
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {initialData ? "Cập nhật" : "Tạo mới"}
        </Button>
      </div>
    </form>
  );
}
