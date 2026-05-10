import { useNavigate, Link, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCreatePermission, useUpdatePermission, usePermission, usePermissionGroups } from "@/hooks/useRoles";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { PermissionEnum } from "@/constants/permissions";
import { useEffect } from "react";

const schema = yup.object().shape({
  name: yup.string().required("Tên quyền là bắt buộc"),
  key: yup
    .string()
    .required("Mã Key là bắt buộc")
    .matches(/^[a-z0-9_\.]+$/, "Key chỉ được chứa chữ thường, số, dấu chấm và dấu gạch dưới"),
  method: yup.string().required("Vui lòng chọn HTTP Method"),
  group_id: yup.number().nullable().optional(),
});

type PermissionFormData = yup.InferType<typeof schema>;

const AdminPermissionForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const permissionId = id ? Number(id) : 0;

  const createPermission = useCreatePermission();
  const updatePermission = useUpdatePermission();
  const { data: existingPermission } = usePermission(permissionId);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PermissionFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      key: "",
      method: "GET",
      group_id: null,
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && existingPermission) {
      reset({
        name: existingPermission.name || "",
        key: existingPermission.slug || existingPermission.key || "",
        method: existingPermission.method || "GET",
        group_id: existingPermission.group_id ?? existingPermission.group?.id ?? null,
      });
    }
  }, [isEditMode, existingPermission, reset]);

  const { data: groupsResponse } = usePermissionGroups();
  const rawGroups = (groupsResponse as any)?.data;
  const groupsList = Array.isArray(rawGroups)
    ? rawGroups
    : Array.isArray(rawGroups?.items)
      ? rawGroups.items
      : [];

  const onSubmit = async (data: PermissionFormData) => {
    try {
      if (isEditMode) {
        await updatePermission.mutateAsync({ id: permissionId, data });
      } else {
        await createPermission.mutateAsync(data);
      }
      navigate("/permissions");
    } catch (error) {
      // Error handled in hook
    }
  };

  const isSaving = isSubmitting || createPermission.isPending || updatePermission.isPending;
  const requiredPermission = isEditMode ? PermissionEnum.PERMISSION_UPDATE : PermissionEnum.PERMISSION_CREATE;
  const pageTitle = isEditMode ? "Chỉnh sửa Quyền Hạn" : "Thêm Quyền Hạn";

  return (
    <AdminLayout title={pageTitle}>
      <PermissionGuard permissions={[requiredPermission]}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center justify-between">
          <Button variant="outline" type="button" asChild>
            <Link to="/permissions">
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
            </Link>
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isEditMode ? "Cập nhật" : "Lưu quyền"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Thông tin Quyền</CardTitle>
              <CardDescription>
                {isEditMode ? "Chỉnh sửa thông tin quyền hạn" : "Khai báo chi tiết quyền hạn mới"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Tên hiển thị <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="name"
                      placeholder="VD: Tạo mới sản phẩm"
                      className={errors.name ? "border-red-500" : ""}
                    />
                  )}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="key">
                  Mã Key <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="key"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="key"
                      placeholder="VD: product.create"
                      className={errors.key ? "border-red-500" : ""}
                    />
                  )}
                />
                {errors.key && <p className="text-xs text-red-500">{errors.key.message}</p>}
                <p className="text-xs text-muted-foreground">
                  Định dạng chuẩn: resource.action
                </p>
              </div>

              <div className="space-y-2">
                <Label>HTTP Method <span className="text-red-500">*</span></Label>
                <Controller
                  name="method"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={errors.method ? "border-red-500" : ""}>
                        <SelectValue placeholder="Chọn phương thức" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET (Lấy dữ liệu)</SelectItem>
                        <SelectItem value="POST">POST (Tạo mới)</SelectItem>
                        <SelectItem value="PUT">PUT (Cập nhật toàn bộ)</SelectItem>
                        <SelectItem value="PATCH">PATCH (Cập nhật 1 phần)</SelectItem>
                        <SelectItem value="DELETE">DELETE (Xóa)</SelectItem>
                        <SelectItem value="ALL">ALL (Tất cả)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.method && <p className="text-xs text-red-500">{errors.method.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Nhóm quyền</Label>
                <Controller
                  name="group_id"
                  control={control}
                  render={({ field }) => (
                    <Select 
                      onValueChange={(val) => field.onChange(val === "none" ? null : Number(val))} 
                      value={field.value ? String(field.value) : "none"}
                    >
                      <SelectTrigger className={errors.group_id ? "border-red-500" : ""}>
                        <SelectValue placeholder="Chọn nhóm quyền (không bắt buộc)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- Không thuộc nhóm nào --</SelectItem>
                        {groupsList.map((g: any) => (
                          <SelectItem key={g.id} value={String(g.id)}>
                            {g.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.group_id && <p className="text-xs text-red-500">{errors.group_id.message}</p>}
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hướng dẫn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <p>
                    <strong>Tên hiển thị:</strong> Là tên sẽ xuất hiện trong màn hình phân quyền cho Role. Hãy đặt tên rõ ràng, dễ hiểu.
                  </p>
                  <p>
                    <strong>Mã Key:</strong> Khóa duy nhất đại diện cho quyền. Thường tuân theo quy tắc <code>resource.action</code>. Ví dụ:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li><code>user.read</code> - Xem người dùng</li>
                    <li><code>user.create</code> - Thêm người dùng</li>
                    <li><code>dashboard.view</code> - Xem bảng điều khiển</li>
                  </ul>
                  <p>
                    <strong>HTTP Method:</strong> Hệ thống có thể dùng để Validate trên REST API.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
      </PermissionGuard>
    </AdminLayout>
  );
};

export default AdminPermissionForm;
