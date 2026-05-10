import { useMemo, useState } from "react";
import { Search, Plus, MoreHorizontal, Edit, Trash2, Shield, Lock, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useRoles, useDeleteRole } from "@/hooks/useRoles";
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
import { Link, useNavigate } from "react-router-dom";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

const AdminRoles = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: rolesData, isLoading, error } = useRoles({ search: searchTerm || undefined });
  const deleteRole = useDeleteRole();

  const roles = useMemo(() => {
    return rolesData?.data || [];
  }, [rolesData]);
  console.log(roles);

  const handleDelete = (id: number) => {
    deleteRole.mutate(id);
  };

  if (error) {
    return (
      <AdminLayout title="Quản lý phân quyền">
        <Card className="h-full flex flex-col items-center justify-center p-8">
          <p className="text-destructive">Lỗi tải dữ liệu: {(error as any).message}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Thử lại
          </Button>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Quản lý phân quyền">
      <Card className="h-full flex flex-col">
        <CardHeader className="border-b shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Danh sách vai trò</CardTitle>
              <CardDescription>Định nghĩa các nhóm quyền hạn trong hệ thống</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm vai trò..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button asChild>
                <Link to="/roles/create">
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
                    <TableHead className="w-[200px]">Tên vai trò</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead className="w-[150px]">Số lượng quyền</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Không có vai trò nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            {role.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground font-mono text-sm">
                          {role.key}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {role.description || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            <span>{role.rolePermissions?.length || 0} quyền</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/roles/edit/${role.id}`)}>
                                <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <ConfirmDialog
                                trigger={
                                  <div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive focus:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" /> Xóa vai trò
                                  </div>
                                }
                                title="Xóa vai trò?"
                                description={`Bạn có chắc chắn muốn xóa vai trò "${role.name}"?`}
                                onConfirm={() => handleDelete(role.id)}
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

export default AdminRoles;
