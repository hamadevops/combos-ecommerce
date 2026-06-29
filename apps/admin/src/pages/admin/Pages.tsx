/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Globe,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { usePages, useDeletePage } from "@/hooks/usePages";

const AdminPages = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: pagesResponse, isLoading } = usePages();
  const deletePage = useDeletePage();

  const pages = (pagesResponse as any)?.data || [];

  const handleDelete = (id: number) => {
    deletePage.mutate(id, {
      onSuccess: () => {
        toast.success("Đã xóa trang");
      },
      onError: (err: any) => {
        toast.error(err?.message || "Lỗi khi xóa trang");
      },
    });
  };

  const filteredPages = (pages || []).filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <AdminLayout title="Quản lý trang">
      <Card className="h-full flex flex-col">
        <CardHeader className="border-b shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Danh sách trang</CardTitle>
              <CardDescription>Quản lý các trang tĩnh và trang chính sách</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm trang..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button asChild>
                <Link to="/pages/create">
                  <Plus className="mr-2 h-4 w-4" /> Thêm trang
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
          <div className="overflow-auto flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                Đang tải danh sách trang...
              </div>
            ) : filteredPages.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 opacity-20 mb-3" />
                <p className="font-medium">Chưa có trang nào</p>
                <p className="text-sm mt-1 mb-4">Hãy tạo trang đầu tiên của bạn.</p>
                <Button asChild variant="outline" size="sm">
                  <Link to="/pages/create">Thêm trang</Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Tiêu đề</TableHead>
                    <TableHead>Đường dẫn (Slug)</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Loại trang</TableHead>
                    <TableHead className="text-right">Cập nhật cuối</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        {page.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground">/{page.slug}</TableCell>
                      <TableCell>
                        <Badge variant={page.isActive ? "secondary" : "outline"}>
                          {page.isActive ? "Công khai" : "Nháp"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {page.type === "system" ? (
                          <Badge variant="default" className="bg-blue-600 hover:bg-blue-600">Hệ thống</Badge>
                        ) : (
                          <Badge variant="outline">Tùy biến</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {new Date(page.updatedAt).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/pages/edit/${page.id}`)}>
                              <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(`/pages/${page.slug}`, "_blank")}>
                              <Globe className="mr-2 h-4 w-4" /> Xem trang
                            </DropdownMenuItem>
                            {page.type !== "system" && (
                              <>
                                <DropdownMenuSeparator />
                                <ConfirmDialog
                                  trigger={
                                    <div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive focus:text-destructive">
                                      <Trash2 className="mr-2 h-4 w-4" /> Xóa
                                    </div>
                                  }
                                  title="Xóa trang?"
                                  description={`Bạn có chắc chắn muốn xóa trang "${page.title}"?`}
                                  onConfirm={() => handleDelete(page.id)}
                                />
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminPages;
