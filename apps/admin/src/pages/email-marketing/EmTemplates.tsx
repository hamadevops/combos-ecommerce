import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useEmTemplates,
  useEmTemplate,
  useDeleteEmTemplate,
  useDuplicateEmTemplate,
} from "@/hooks/useEmailMarketing";
import {
  Plus,
  Search,
  FileText,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Eye,
  X,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { emTemplateApi } from "@/api/email-marketing";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function EmTemplates() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const navigate = useNavigate();

  const { data, isLoading } = useEmTemplates({
    page,
    limit: 20,
    search: search || undefined,
  });

  const deleteTemplate = useDeleteEmTemplate();
  const duplicateTemplate = useDuplicateEmTemplate();

  const templates = data?.items || [];
  const meta = data?.meta;

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleDelete = (id: number) => {
    deleteTemplate.mutate(id);
  };

  const handleDuplicate = (id: number) => {
    duplicateTemplate.mutate(id);
  };

  const handlePreview = async (id: number) => {
    setIsPreviewLoading(true);
    try {
      const res = await emTemplateApi.getOne(id);
      setPreviewTemplate(res);
      setPreviewDialogOpen(true);
    } catch (err: any) {
      toast.error("Không thể tải nội dung template để preview");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  return (
    <AdminLayout title="Quản lý Templates">
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Email Templates
              </CardTitle>
              <CardDescription>
                Tạo và quản lý mẫu email. Tổng: {meta?.total || 0} templates
              </CardDescription>
            </div>
            <Link to="/email-marketing/templates/new">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Tạo template
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Tìm theo tên, subject..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="max-w-sm"
              />
              <Button variant="outline" size="icon" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên template</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead className="hidden md:table-cell">Xem thử</TableHead>
                    <TableHead className="hidden lg:table-cell">Ngày cập nhật</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={5}>
                          <Skeleton className="h-8 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : templates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p>Chưa có template nào</p>
                        <Link to="/email-marketing/templates/new">
                          <Button variant="outline" size="sm" className="mt-3">
                            <Plus className="h-4 w-4 mr-1" />
                            Tạo template đầu tiên
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ) : (
                    templates.map((template: any) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{template.subject}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-8 text-primary gap-1.5"
                            onClick={() => handlePreview(template.id)}
                            disabled={isPreviewLoading}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Preview
                          </Button>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                          {template.updatedAt
                            ? new Date(template.updatedAt).toLocaleDateString("vi-VN")
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(`/email-marketing/templates/${template.id}`)
                                }
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicate(template.id)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Nhân bản
                              </DropdownMenuItem>
                              <ConfirmDialog
                                trigger={
                                  <div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive focus:text-destructive">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Xóa
                                  </div>
                                }
                                title="Xóa template?"
                                description={`Bạn có chắc chắn muốn xóa template "${template.name}"?`}
                                onConfirm={() => handleDelete(template.id)}
                              />
                            </DropdownMenuContent>
                          </DropdownMenu>
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
                      // Simple logic to show only nearby pages if many
                      if (meta.totalPages > 7) {
                        if (
                          pageNum !== 1 &&
                          pageNum !== meta.totalPages &&
                          Math.abs(pageNum - page) > 2
                        ) {
                          if (Math.abs(pageNum - page) === 3)
                            return (
                              <span key={pageNum} className="px-2">
                                ...
                              </span>
                            );
                          return null;
                        }
                      }
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
        {/* Preview Dialog */}
        <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
            <DialogHeader className="p-4 border-b bg-slate-50 flex flex-row items-center justify-between">
              <div>
                <DialogTitle>Xem trước Template</DialogTitle>
                {previewTemplate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Template: <span className="font-medium">{previewTemplate.name}</span>
                  </p>
                )}
              </div>
            </DialogHeader>
            <div className="p-4 bg-white border-b space-y-2">
              <div className="flex gap-2 items-center text-sm">
                <span className="font-semibold w-16 text-muted-foreground">Subject:</span>
                <span className="px-2 py-0.5 bg-slate-100 rounded border">
                  {previewTemplate?.subject}
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-slate-100 p-4 sm:p-8 flex justify-center">
              <div className="bg-white shadow-xl w-full max-w-2xl min-h-[500px] rounded-sm overflow-hidden border">
                {previewTemplate?.htmlContent ? (
                  <iframe
                    srcDoc={previewTemplate.htmlContent}
                    className="w-full h-full min-h-[500px] border-0"
                    title="Template Preview"
                    sandbox="allow-same-origin"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Không có nội dung hiển thị
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
