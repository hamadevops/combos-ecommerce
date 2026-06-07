/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Star,
  Search,
  User,
  Image as ImageIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  useAppFeedbacks,
  useDeleteAppFeedback,
  useUpdateAppFeedback,
} from "@/hooks/useAppFeedbacks";
import { getImageUrl } from "@/lib/utils";
import { toast } from "sonner";

const AdminAppFeedbacks = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch feedbacks
  const { data: feedbacksResponse, isLoading } = useAppFeedbacks({
    page,
    limit,
    search: search || undefined,
  });

  const deleteFeedback = useDeleteAppFeedback();
  const updateFeedback = useUpdateAppFeedback();

  // Extract data & meta
  const feedbacks = feedbacksResponse?.data || [];
  const meta = feedbacksResponse?.meta;
  const totalPages = meta?.totalPages || 1;

  const handleDelete = (id: number) => {
    deleteFeedback.mutate(id, {
      onSuccess: () => {
        toast.success("Xóa đánh giá thành công");
      },
      onError: (err: any) => {
        toast.error(err?.message || "Lỗi khi xóa đánh giá");
      },
    });
  };

  const handleToggleActive = (id: number, currentStatus: boolean) => {
    updateFeedback.mutate(
      {
        id,
        data: { isActive: !currentStatus },
      },
      {
        onSuccess: () => {
          toast.success("Cập nhật trạng thái thành công");
        },
        onError: (err: any) => {
          toast.error(err?.message || "Lỗi khi cập nhật trạng thái");
        },
      }
    );
  };

  return (
    <AdminLayout title="Đánh giá từ khách hàng">
      <Card className="h-full flex flex-col">
        <CardHeader className="border-b shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Danh sách đánh giá ứng dụng</CardTitle>
              <CardDescription>
                Quản lý các phản hồi, đánh giá từ khách hàng hiển thị trên trang chủ storefront.
              </CardDescription>
            </div>
            <Button asChild>
              <Link to="/app-feedbacks/create">
                <Plus className="mr-2 h-4 w-4" /> Thêm đánh giá
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-2 mt-4 max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm tên khách hàng, nội dung..."
                className="pl-8"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
          <div className="overflow-auto flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                Đang tải dữ liệu...
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                <ImageIcon className="h-12 w-12 opacity-20 mb-3" />
                <p className="font-medium">Chưa có đánh giá nào</p>
                <p className="text-sm mt-1 mb-4">Hãy thêm đánh giá khách hàng đầu tiên của bạn.</p>
                <Button asChild variant="outline" size="sm">
                  <Link to="/app-feedbacks/create">Tạo đánh giá</Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Khách hàng</TableHead>
                    <TableHead className="w-[180px]">Tên</TableHead>
                    <TableHead>Nội dung đánh giá</TableHead>
                    <TableHead className="w-[120px]">Số sao</TableHead>
                    <TableHead className="w-[100px] text-center">Ảnh đính kèm</TableHead>
                    <TableHead className="w-[100px] text-center">Hiển thị</TableHead>
                    <TableHead className="w-[100px]">Thứ tự</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbacks.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-muted flex items-center justify-center border">
                          {item.customerAvatar ? (
                            <img
                              src={getImageUrl(item.customerAvatar)}
                              alt={item.customerName || "Avatar"}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <User className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.customerName || <span className="text-muted-foreground italic">Chưa đặt tên</span>}
                      </TableCell>
                      <TableCell className="max-w-md truncate text-muted-foreground">
                        {item.content || <span className="italic text-muted-foreground/55">Không có nội dung</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star
                              key={idx}
                              className={`h-4 w-4 ${
                                idx < (item.rating || 5)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted border-yellow-400"
                              }`}
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.image ? (
                          <div className="inline-block h-8 w-12 rounded border overflow-hidden bg-muted relative group">
                            <img
                              src={getImageUrl(item.image)}
                              alt="Feedback screenshot"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Switch
                            checked={item.isActive}
                            onCheckedChange={() => handleToggleActive(item.id, item.isActive)}
                          />
                        </div>
                      </TableCell>
                      <TableCell>{item.sortOrder || 0}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/app-feedbacks/edit/${item.id}`)}>
                              <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <ConfirmDialog
                              trigger={
                                <div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive focus:text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" /> Xóa
                                </div>
                              }
                              title="Xóa đánh giá?"
                              description={`Bạn có chắc chắn muốn xóa đánh giá của khách hàng "${item.customerName || "Ẩn danh"}"?`}
                              onConfirm={() => handleDelete(item.id)}
                            />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {totalPages > 1 && (
            <div className="border-t p-4 flex items-center justify-between shrink-0">
              <span className="text-sm text-muted-foreground">
                Trang {page} / {totalPages} (Tổng số {meta?.totalItems || feedbacks.length} bản ghi)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminAppFeedbacks;
