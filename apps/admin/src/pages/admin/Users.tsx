import { useState, useMemo } from "react";
import { Search, Plus, MoreHorizontal, Edit, Trash2, Shield, Mail, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useUsers } from "@/hooks/useUsers";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { userApi } from "@/api/user";
import { useQueryClient } from "@tanstack/react-query";
import { getImageUrl } from "@/lib/utils";

const AdminUsers = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const {
    data: response,
    isLoading,
    error,
  } = useUsers({
    page,
    limit: 20,
    search: searchTerm || undefined,
  });

  // Memoized data extraction
  const { users, meta } = useMemo(() => {
    console.log("AdminUsers response:", response);
    const data = response?.data;
    if (Array.isArray(data)) {
      return { users: data, meta: response?.meta || null };
    }
    // Fallback for nested data structure or incorrect type
    if (data && typeof data === "object" && "data" in data && Array.isArray((data as any).data)) {
      return { users: (data as any).data, meta: (data as any).meta || response?.meta || null };
    }
    return { users: [], meta: response?.meta || null };
  }, [response]);

  const handleDelete = async (id: number) => {
    try {
      await userApi.delete(id);
      toast.success("Đã xóa thành viên");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (err) {
      toast.error("Không thể xóa thành viên");
    }
  };

  const getRoleBadgeColor = (roleName: string = "") => {
    switch (roleName.toLowerCase()) {
      case "administrator":
      case "admin":
        return "destructive";
      case "editor":
        return "default";
      default:
        return "secondary";
    }
  };

  if (error) {
    return (
      <AdminLayout title="Quản lý thành viên">
        <Card className="h-full flex flex-col items-center justify-center">
          <CardContent className="text-center py-10">
            <p className="text-destructive">Không thể tải danh sách thành viên</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["users"] })}
            >
              Thử lại
            </Button>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Quản lý thành viên">
      <Card className="h-full flex flex-col">
        <CardHeader className="border-b shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Danh sách thành viên</CardTitle>
              <CardDescription>Quản lý tài khoản và phân quyền truy cập</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm thành viên..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button asChild>
                <Link to="/users/create">
                  <Plus className="mr-2 h-4 w-4" /> Thêm mới
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-auto h-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Thành viên</TableHead>
                    <TableHead>Vai trò (Role)</TableHead>
                    <TableHead className="text-right">Ngày tạo</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                        Không có thành viên nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={getImageUrl(user.avatar)} />
                              <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium">{user.name}</span>
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {user.email}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeColor((user.role as any)?.name)}>
                            <Shield className="mr-1 h-3 w-3" />
                            {(user.role as any)?.name || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/users/edit/${user.id}`)}>
                                <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <ConfirmDialog
                                trigger={
                                  <div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive focus:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" /> Xóa tài khoản
                                  </div>
                                }
                                title="Xóa tài khoản?"
                                description={`Bạn có chắc chắn muốn xóa tài khoản "${user.name}"?`}
                                onConfirm={() => handleDelete(user.id)}
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
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminUsers;
