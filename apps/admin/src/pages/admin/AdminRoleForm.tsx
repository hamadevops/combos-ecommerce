import { useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRole, useGroupedPermissions, useCreateRole, useUpdateRole } from "@/hooks/useRoles";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Permission } from "@/types/role";

// Define validation schema
const schema = yup.object().shape({
  name: yup.string().required("Tên vai trò là bắt buộc"),
  key: yup
    .string()
    .required("Key là bắt buộc")
    .matches(/^[a-z_]+$/, "Key chỉ được chứa chữ thường và dấu gạch dưới"),
  description: yup.string().optional(),
  permission_ids: yup.array().of(yup.number().required()).default([]),
});

type RoleFormData = yup.InferType<typeof schema>;

const AdminRoleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const roleId = id ? Number(id) : 0;

  // API hooks
  const { data: role, isLoading: isLoadingRole } = useRole(roleId);
  const { data: groupedResponse, isLoading: isLoadingPermissions } = useGroupedPermissions();
  const rawGrouped = (groupedResponse as any)?.data;
  const groupedList = Array.isArray(rawGrouped)
    ? rawGrouped
    : Array.isArray(rawGrouped?.data)
      ? rawGrouped.data
      : [];
  
  // Flatten permissions for easy ID lookup if needed
  const flatPermissions = useMemo(() => {
    const list: any[] = [];
    groupedList.forEach((group: any) => {
      if (group.permissions && Array.isArray(group.permissions)) {
        list.push(...group.permissions);
      }
    });
    return list;
  }, [groupedList]);
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<RoleFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      key: "",
      description: "",
      permission_ids: [],
    },
  });

  const currentPermissionIds = watch("permission_ids") || [];

  // Reset form when role data is loaded
  useEffect(() => {
    if (isEditing && role) {
      let permissionIds: number[] = [];
      // Unwrap role data if it's nested in a 'data' property
      const roleData = (role as any).data || role;

      // Start checking for permissions in either property
      // Prioritize permissions array if it seems to contain direct permissions (has key/slug)
      // Otherwise check rolePermissions which might be pivot records
      const hasDirectPermissions =
        roleData.permissions &&
        roleData.permissions.length > 0 &&
        (roleData.permissions[0].key || roleData.permissions[0].slug);

      const rolePerms = hasDirectPermissions
        ? roleData.permissions
        : roleData.rolePermissions || roleData.permissions || [];

      permissionIds = rolePerms
        .map((p: any) => {
          // Handle numeric IDs directly
          if (typeof p === "number") return p;

          // Handle nested structure: {permission: {id: ...}}
          if (typeof p === "object" && p !== null) {
            // Check for nested permission object (rolePermissions structure with relation loaded)
            if ("permission" in p && p.permission && typeof p.permission === "object") {
              return Number((p.permission as any).id);
            }

            // Check for pivot fields (permissionId or permission_id) if relation not loaded
            if ("permissionId" in p) return Number((p as any).permissionId);
            if ("permission_id" in p) return Number((p as any).permission_id);

            // Direct permission object (permissions structure) or fallback
            if ("key" in p || "slug" in p || "name" in p) {
              return Number(p.id);
            }

            // Pivot with just IDs
            if ("permission_id" in p || "permissionId" in p)
              return Number((p as any).permission_id || (p as any).permissionId);

            // Last resort: if it has an ID and we're seemingly iterating direct permissions (even without keys?)
            // or if it's the only ID available?
            // CAUTION: Using p.id for pivot record is WRONG.
            // But if we failed all above, checking 'roleId' existence confirms it's a pivot
            if ("roleId" in p || "role_id" in p) {
              return null; // Don't use pivot ID as permission ID
            }

            // If it has 'id' but no roleId, it might be a permission object with missing key/name data?
            // Or a pivot without roleId loaded?
            // Let's assume it's safe to use ID if it's NOT a declared pivot
            if ("id" in p) return Number(p.id);

            return null;
          }
          if (typeof p === "string") {
            // Find ID from the permissions list
            const list = flatPermissions;
            const found = list.find((perm: any) => (perm.slug || perm.key) === p);
            return found ? Number(found.id) : null;
          }
          return null;
        })
        .filter((id: any): id is number => id !== null && !isNaN(id));

      console.log("DEBUG permissionIds:", permissionIds);

      reset({
        name: roleData.name,
        key: roleData.key,
        description: roleData.description || "",
        permission_ids: permissionIds,
      });
    }
  }, [role, isEditing, reset, flatPermissions]);

  const onSubmit = async (data: RoleFormData) => {
    try {
      const payload = {
        name: data.name,
        key: data.key,
        description: data.description,
        permission_ids: data.permission_ids.map((id) => String(id)),
      };
      if (isEditing) {
        await updateRole.mutateAsync({ id: roleId, data: payload });
      } else {
        await createRole.mutateAsync(payload as any);
      }
      navigate("/roles");
    } catch (error) {
      // Error is handled in the hook
    }
  };

  // Define UI specific permission type
  interface PermissionUI {
    id: number;
    key: string;
    name: string;
    group: string;
  }

  const groupedPermissions = useMemo(() => {
    if (!groupedList || groupedList.length === 0) return {};
    
    // Convert API format to UI format
    const groups: Record<string, PermissionUI[]> = {};
    
    groupedList.forEach((group: any) => {
      const groupName = group.name || "Khác";
      groups[groupName] = (group.permissions || []).map((p: any) => ({
        id: p.id,
        key: p.slug || p.key,
        name: p.description || p.name || p.slug || "Unknown",
        group: groupName,
      }));
    });
    
    return groups;
  }, [groupedList]);

  const togglePermission = (permissionId: number) => {
    const hasPermission = currentPermissionIds.includes(permissionId);
    const newPermissions = hasPermission
      ? currentPermissionIds.filter((p) => p !== permissionId)
      : [...currentPermissionIds, permissionId];
    setValue("permission_ids", newPermissions, { shouldDirty: true });
  };

  const toggleGroup = (groupPermissions: any[]) => {
    const groupIds = groupPermissions.map((p) => p.id);
    const allSelected = groupIds.every((id) => currentPermissionIds.includes(id));

    if (allSelected) {
      // Deselect all
      const newPermissions = currentPermissionIds.filter((p) => !groupIds.includes(p));
      setValue("permission_ids", newPermissions, { shouldDirty: true });
    } else {
      // Select all
      const newPermissions = Array.from(new Set([...currentPermissionIds, ...groupIds]));
      setValue("permission_ids", newPermissions, { shouldDirty: true });
    }
  };

  const isLoading = isLoadingRole || isLoadingPermissions;
  const isSaving = createRole.isPending || updateRole.isPending;

  if (isLoading) {
    return (
      <AdminLayout title={isEditing ? "Chỉnh sửa vai trò" : "Thêm vai trò mới"}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEditing ? "Chỉnh sửa vai trò" : "Thêm vai trò mới"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Button variant="outline" type="button" asChild>
            <Link to="/roles">
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
            </Link>
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isEditing ? "Cập nhật" : "Tạo mới"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Permissions Matrix */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Phân quyền chi tiết</CardTitle>
                <CardDescription>Chọn các quyền hạn cho vai trò này</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.keys(groupedPermissions).length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Không có quyền nào được định nghĩa
                  </p>
                ) : (
                  Object.entries(groupedPermissions).map(([group, perms]) => {
                    const allSelected = perms.every((p) => currentPermissionIds.includes(p.id));

                    return (
                      <div key={group} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between border-b pb-2">
                          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                            {group}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`group-${group}`}
                              checked={allSelected}
                              onCheckedChange={() => toggleGroup(perms)}
                            />
                            <Label
                              htmlFor={`group-${group}`}
                              className="text-xs cursor-pointer select-none"
                            >
                              Chọn tất cả
                            </Label>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {perms.map((permission) => (
                            <div key={permission.id} className="flex items-start space-x-2">
                              <Checkbox
                                id={`perm-${permission.id}`}
                                checked={currentPermissionIds.includes(permission.id)}
                                onCheckedChange={() => togglePermission(permission.id)}
                              />
                              <div className="grid gap-1.5 leading-none">
                                <Label
                                  htmlFor={`perm-${permission.id}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                  {permission.name}
                                </Label>
                                <p className="text-[0.8rem] text-muted-foreground">
                                  {permission.key}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Role Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thông tin vai trò</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Tên vai trò <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="name"
                        placeholder="Ví dụ: Editor"
                        className={errors.name ? "border-red-500" : ""}
                      />
                    )}
                  />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="key">
                    Key <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="key"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="key"
                        placeholder="Ví dụ: editor"
                        className={errors.key ? "border-red-500" : ""}
                      />
                    )}
                  />
                  {errors.key && <p className="text-xs text-red-500">{errors.key.message}</p>}
                  <p className="text-xs text-muted-foreground">
                    Chỉ chứa chữ thường và dấu gạch dưới
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        id="description"
                        placeholder="Mô tả ngắn gọn về vai trò này..."
                        rows={4}
                        value={field.value || ""}
                      />
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminRoleForm;
