import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Loader2, Edit, Trash2 } from "lucide-react";
import { usePermissions, useDeletePermission } from "@/hooks/useRoles";
import { useState } from "react";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { PermissionEnum } from "@/constants/permissions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AdminPermissions = () => {
  const { data: permissions = [], isLoading } = usePermissions();
  const deletePermission = useDeletePermission();
  const [searchTerm, setSearchTerm] = useState("");

  const rawList = Array.isArray(permissions) ? permissions : (permissions as any)?.data || [];
  
  const filteredPermissions = rawList.filter((p: any) =>
    (p.name || p.slug || p.key || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.slug || p.key || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    try {
      await deletePermission.mutateAsync(id);
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <AdminLayout title="Quản lý Quyền hạn">
      <PermissionGuard permissions={[PermissionEnum.PERMISSION_READ]}>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm quyền hạn..."
              className="pl-8 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button asChild>
            <Link to="/permissions/create">
              <Plus className="mr-2 h-4 w-4" /> Thêm quyền mới
            </Link>
          </Button>
        </div>

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Tên quyền</TableHead>
                <TableHead>Mã (Key)</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Group</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                     <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                     </div>
                  </TableCell>
                </TableRow>
              ) : filteredPermissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Không tìm thấy quyền hạn nào.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPermissions.map((permission: any) => (
                  <TableRow key={permission.id}>
                    <TableCell className="font-medium">{permission.id}</TableCell>
                    <TableCell>{permission.name || permission.description || '-'}</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                        {permission.slug || permission.key}
                      </code>
                    </TableCell>
                    <TableCell>
                      {permission.method ? (
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                          {permission.method}
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {typeof permission.group === 'object' && permission.group !== null ? permission.group.name : permission.group || 'Khác'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link to={`/permissions/edit/${permission.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xóa quyền hạn?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bạn có chắc muốn xóa quyền <strong>"{permission.name || permission.key}"</strong>? Hành động này không thể hoàn tác.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(permission.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      </PermissionGuard>
    </AdminLayout>
  );
};

export default AdminPermissions;
