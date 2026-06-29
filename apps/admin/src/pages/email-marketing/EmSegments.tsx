import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useEmSegments,
  useCreateEmSegment,
  useDeleteEmSegment,
  useUpdateEmSegment,
} from "@/hooks/useEmailMarketing";
import type { EmSegmentDto } from "@projects/shared";
import { Plus, Edit, Trash2, Tags, Users, Loader2, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { AddContactsDialog } from "./components/AddContactsDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function EmSegments() {
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<EmSegmentDto | null>(null);
  const [addContactsSegmentId, setAddContactsSegmentId] = useState<number | null>(null);

  const { data, isLoading } = useEmSegments({ page, limit: 10 });
  const meta = data?.meta;
  const createSegment = useCreateEmSegment();
  const deleteSegment = useDeleteEmSegment();

  const segmentList = data?.items || [];

  const handleOpenCreate = () => {
    setEditingSegment(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (segment: EmSegmentDto) => {
    setEditingSegment(segment);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteSegment.mutate(id);
  };

  return (
    <AdminLayout title="Quản lý Segments">
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Tags className="h-5 w-5" />
                Segments
              </CardTitle>
              <CardDescription>Nhóm contacts theo tiêu chí để gửi email targeted</CardDescription>
            </div>
            <Button size="sm" onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-1" />
              Tạo segment
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên segment</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead className="text-center">Số contacts</TableHead>
                    <TableHead className="hidden md:table-cell">Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(3)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={5}>
                          <Skeleton className="h-8 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : segmentList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        <Tags className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p>Chưa có segment nào</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    segmentList.map((segment: EmSegmentDto) => (
                      <TableRow key={segment.id}>
                        <TableCell>
                          <Link
                            to={`/email-marketing/segments/${segment.id}`}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {segment.name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-[250px] truncate">
                          {segment.description || "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="font-mono">
                            <Users className="h-3 w-3 mr-1" />
                            {segment.contactCount ?? 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {segment.createdAt
                            ? new Date(segment.createdAt).toLocaleDateString("vi-VN")
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Thêm contacts"
                              onClick={() => setAddContactsSegmentId(segment.id)}
                            >
                              <UserPlus className="h-4 w-4 text-primary" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(segment)}
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
                              title="Xóa segment?"
                              description={`Bạn có chắc chắn muốn xóa segment "${segment.name}" và toàn bộ contacts đã thêm vào?`}
                              onConfirm={() => handleDelete(segment.id)}
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
                    {[...Array(meta.totalPages)].map((_, i) => {
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

        {/* Create/Edit Dialog */}
        <SegmentDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initialData={editingSegment}
        />

        <AddContactsDialog
          open={!!addContactsSegmentId}
          onOpenChange={(open) => !open && setAddContactsSegmentId(null)}
          segmentId={addContactsSegmentId || 0}
        />
      </div>
    </AdminLayout>
  );
}

// ─── Segment Dialog ─────────────────────────────────────────────────────────────

function SegmentDialog({
  open,
  onOpenChange,
  initialData,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: EmSegmentDto | null;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const createSegment = useCreateEmSegment();
  const updateSegment = useUpdateEmSegment(initialData?.id || 0);

  // Reset form when initialData changes or dialog opens
  useEffect(() => {
    if (open) {
      setName(initialData?.name || "");
      setDescription(initialData?.description || "");
    }
  }, [initialData, open]);

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Tên segment là bắt buộc");
      return;
    }

    const data = {
      name: name.trim(),
      description: description.trim() || undefined,
    };

    if (initialData) {
      updateSegment.mutate(data, {
        onSuccess: () => onOpenChange(false),
      });
    } else {
      createSegment.mutate(data, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  const isPending = createSegment.isPending || updateSegment.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Chỉnh sửa Segment" : "Tạo Segment mới"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Cập nhật thông tin segment" : "Tạo nhóm mới để phân loại contacts"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="segment-name">Tên segment *</Label>
            <Input
              id="segment-name"
              placeholder="VD: VIP Customers, Newsletter"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="segment-desc">Mô tả</Label>
            <Textarea
              id="segment-desc"
              placeholder="Mô tả ngắn về segment này..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {initialData ? "Cập nhật" : "Tạo mới"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
