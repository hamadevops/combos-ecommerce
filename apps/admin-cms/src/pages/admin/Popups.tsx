import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  MessageSquare,
  MoreHorizontal,
  Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { usePopups, useDeletePopup } from "@/hooks/usePopups";
import { Popup } from "@/types/popup";
import { toast } from "sonner";
import { getImageUrl } from "@/lib/utils";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

const AdminPopups = () => {
  const navigate = useNavigate();
  const { data: popupsData, isLoading } = usePopups();
  const deletePopup = useDeletePopup();

  const popups: Popup[] = popupsData?.data || popupsData || [];

  const handleDelete = (id: number) => {
    deletePopup.mutate(id);
  };

  return (
    <AdminLayout title="Quản lý Popups">
      <Card className="h-full flex flex-col">
        <CardHeader className="border-b shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Danh sách Popups</CardTitle>
              <CardDescription>Quản lý các popup hiển thị trên website</CardDescription>
            </div>
            <Button asChild>
              <Link to="/popups/create">
                <Plus className="mr-2 h-4 w-4" /> Thêm Popup
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          <div className="overflow-auto h-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Hình ảnh</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Mã KM</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[80px] text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Đang tải dữ liệu...
                    </TableCell>
                  </TableRow>
                ) : popups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Chưa có popup nào. Hãy thêm mới!
                    </TableCell>
                  </TableRow>
                ) : (
                  popups.map((popup) => (
                    <TableRow key={popup.id}>
                      <TableCell>
                        {popup.image_url ? (
                          <div className="h-10 w-10 rounded-md overflow-hidden bg-muted border">
                            <img
                              src={getImageUrl(popup.image_url)}
                              alt="popup"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center border">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{popup.title || "(Không tiêu đề)"}</span>
                          {popup.description && (
                            <span className="text-xs text-muted-foreground truncate w-[200px]">
                              {popup.description}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{popup.position}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {popup.link ? (
                          <a
                            href={popup.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline text-sm"
                          >
                            {popup.link}
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {popup.promo_code ? (
                          <code className="bg-muted px-1.5 py-0.5 rounded text-xs select-all">
                            {popup.promo_code}
                          </code>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={popup.is_active ? "default" : "secondary"}>
                          {popup.is_active ? "Hoạt động" : "Tạm ẩn"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/popups/edit/${popup.id}`)}>
                              <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <ConfirmDialog
                              trigger={
                                <div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive focus:text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" /> Xóa
                                </div>
                              }
                              title="Xóa Popup?"
                              description={`Bạn có chắc chắn muốn xóa popup này?`}
                              onConfirm={() => handleDelete(popup.id)}
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
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminPopups;
