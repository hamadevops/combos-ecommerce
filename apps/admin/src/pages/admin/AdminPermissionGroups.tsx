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
import { Plus, Search, Loader2, Edit, Trash2, ChevronDown, ChevronRight, Shield, X } from "lucide-react";
import {
  usePermissionGroups,
  useDeletePermissionGroup,
  useGroupedPermissions,
  usePermissions,
  useAssignPermissionsToGroup,
  useRemovePermissionsFromGroup,
} from "@/hooks/useRoles";
import { useState, useMemo } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const AdminPermissionGroups = () => {
  const { data: groupsResponse = {}, isLoading } = usePermissionGroups();
  const { data: groupedResponse } = useGroupedPermissions();
  const { data: allPermsResponse } = usePermissions();
  const deleteGroup = useDeletePermissionGroup();
  const assignPermissions = useAssignPermissionsToGroup();
  const removePermissions = useRemovePermissionsFromGroup();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedGroupId, setExpandedGroupId] = useState<number | null>(null);
  const [assignDialogGroupId, setAssignDialogGroupId] = useState<number | null>(null);
  const [selectedPermIds, setSelectedPermIds] = useState<number[]>([]);
  const [assignSearch, setAssignSearch] = useState("");

  // Extract groups list
  const rawGroups = (groupsResponse as any)?.data;
  const groups = Array.isArray(rawGroups)
    ? rawGroups
    : Array.isArray(rawGroups?.items)
      ? rawGroups.items
      : [];

  // Extract grouped permissions (includes permissions per group)
  const rawGrouped = (groupedResponse as any)?.data;
  const groupedList = Array.isArray(rawGrouped)
    ? rawGrouped
    : Array.isArray(rawGrouped?.data)
      ? rawGrouped.data
      : [];

  // Build a map: groupId -> permissions[]
  const groupPermissionsMap = useMemo(() => {
    const map: Record<number, any[]> = {};
    groupedList.forEach((g: any) => {
      map[g.id] = g.permissions || [];
    });
    return map;
  }, [groupedList]);

  // Extract all permissions
  const rawPerms = (allPermsResponse as any)?.data;
  const allPermissions = Array.isArray(rawPerms) ? rawPerms : Array.isArray(allPermsResponse) ? allPermsResponse : [];

  // Permissions not assigned to any group (for assign dialog)
  const unassignedPermissions = useMemo(() => {
    const assignedIds = new Set<number>();
    groupedList.forEach((g: any) => {
      (g.permissions || []).forEach((p: any) => assignedIds.add(p.id));
    });
    return allPermissions.filter((p: any) => !assignedIds.has(p.id));
  }, [allPermissions, groupedList]);

  const filteredGroups = groups.filter((g: any) =>
    (g.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (g.key || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    try {
      await deleteGroup.mutateAsync(id);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleRemovePermission = async (groupId: number, permissionId: number) => {
    try {
      await removePermissions.mutateAsync({ groupId, permissionIds: [permissionId] });
    } catch (error) {
      // Error handled in hook
    }
  };

  const openAssignDialog = (groupId: number) => {
    setAssignDialogGroupId(groupId);
    setSelectedPermIds([]);
    setAssignSearch("");
  };

  const handleAssign = async () => {
    if (!assignDialogGroupId || selectedPermIds.length === 0) return;
    try {
      await assignPermissions.mutateAsync({
        groupId: assignDialogGroupId,
        permissionIds: selectedPermIds,
      });
      setAssignDialogGroupId(null);
      setSelectedPermIds([]);
    } catch (error) {
      // Error handled in hook
    }
  };

  const togglePermId = (id: number) => {
    setSelectedPermIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const filteredUnassigned = unassignedPermissions.filter((p: any) =>
    (p.name || "").toLowerCase().includes(assignSearch.toLowerCase()) ||
    (p.key || "").toLowerCase().includes(assignSearch.toLowerCase())
  );

  return (
    <AdminLayout title="Nhóm Quyền (Permission Groups)">
      <PermissionGuard permissions={[PermissionEnum.PERMISSION_READ]}>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm nhóm quyền..."
              className="pl-8 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button asChild>
            <Link to="/permission-groups/create">
              <Plus className="mr-2 h-4 w-4" /> Thêm Nhóm Mới
            </Link>
          </Button>
        </div>

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead className="w-[60px]">ID</TableHead>
                <TableHead>Tên Nhóm</TableHead>
                <TableHead>Mã (Key)</TableHead>
                <TableHead>Thứ tự</TableHead>
                <TableHead>Số quyền</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                     <div className="flex justify-center flex flex-col items-center">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                     </div>
                  </TableCell>
                </TableRow>
              ) : filteredGroups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Không tìm thấy nhóm quyền nào.
                  </TableCell>
                </TableRow>
              ) : (
                filteredGroups.map((group: any) => {
                  const isExpanded = expandedGroupId === group.id;
                  const permsInGroup = groupPermissionsMap[group.id] || [];

                  return (
                    <>
                      <TableRow
                        key={group.id}
                        className="cursor-pointer hover:bg-accent/50"
                        onClick={() => setExpandedGroupId(isExpanded ? null : group.id)}
                      >
                        <TableCell className="px-2">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{group.id}</TableCell>
                        <TableCell className="font-medium">{group.name}</TableCell>
                        <TableCell>
                          <code className="rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                            {group.key}
                          </code>
                        </TableCell>
                        <TableCell>{group.display_order}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{permsInGroup.length} quyền</Badge>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => openAssignDialog(group.id)}
                            >
                              <Shield className="mr-1 h-3.5 w-3.5" /> Gán quyền
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <Link to={`/permission-groups/edit/${group.id}`}>
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
                                  <AlertDialogTitle>Xóa nhóm quyền?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Hành động này không thể hoàn tác. Các quyền thuộc nhóm này sẽ mất liên kết với nhóm.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(group.id)}
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

                      {/* Expanded: Show permissions in this group */}
                      {isExpanded && (
                        <TableRow key={`expanded-${group.id}`}>
                          <TableCell colSpan={7} className="bg-muted/30 p-0">
                            <div className="px-6 py-4">
                              {permsInGroup.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-3">
                                  Chưa có quyền nào trong nhóm này.{" "}
                                  <button
                                    className="text-primary underline"
                                    onClick={() => openAssignDialog(group.id)}
                                  >
                                    Gán quyền ngay
                                  </button>
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-semibold text-muted-foreground">
                                      Danh sách quyền trong nhóm "{group.name}"
                                    </h4>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {permsInGroup.map((perm: any) => (
                                      <div
                                        key={perm.id}
                                        className="flex items-center justify-between rounded-md border bg-card px-3 py-2 text-sm group"
                                      >
                                        <div className="min-w-0">
                                          <p className="font-medium truncate">{perm.name}</p>
                                          <p className="text-xs text-muted-foreground truncate">{perm.key}</p>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 shrink-0 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                          onClick={() => handleRemovePermission(group.id, perm.id)}
                                          disabled={removePermissions.isPending}
                                        >
                                          <X className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Assign Permissions Dialog */}
      <Dialog open={assignDialogGroupId !== null} onOpenChange={(open) => !open && setAssignDialogGroupId(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Gán quyền vào nhóm "{groups.find((g: any) => g.id === assignDialogGroupId)?.name}"
            </DialogTitle>
            <DialogDescription>
              Chọn các quyền chưa được gán vào nhóm nào để thêm vào nhóm này.
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm quyền..."
              className="pl-8"
              value={assignSearch}
              onChange={(e) => setAssignSearch(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 space-y-1 pr-1" style={{ maxHeight: "40vh" }}>
            {filteredUnassigned.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                {unassignedPermissions.length === 0
                  ? "Tất cả quyền đã được gán vào nhóm."
                  : "Không tìm thấy quyền nào phù hợp."}
              </p>
            ) : (
              filteredUnassigned.map((p: any) => (
                <div
                  key={p.id}
                  className="flex items-center space-x-3 rounded-md border px-3 py-2 hover:bg-accent/50 cursor-pointer"
                  onClick={() => togglePermId(p.id)}
                >
                  <Checkbox
                    id={`assign-perm-${p.id}`}
                    checked={selectedPermIds.includes(p.id)}
                    onCheckedChange={() => togglePermId(p.id)}
                  />
                  <Label htmlFor={`assign-perm-${p.id}`} className="flex-1 cursor-pointer">
                    <span className="text-sm font-medium">{p.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">({p.key})</span>
                    {p.method && (
                      <Badge variant="outline" className="ml-2 text-[10px]">{p.method}</Badge>
                    )}
                  </Label>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogGroupId(null)}>
              Hủy
            </Button>
            <Button
              onClick={handleAssign}
              disabled={selectedPermIds.length === 0 || assignPermissions.isPending}
            >
              {assignPermissions.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gán {selectedPermIds.length > 0 ? `(${selectedPermIds.length})` : ""} quyền
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </PermissionGuard>
    </AdminLayout>
  );
};

export default AdminPermissionGroups;
