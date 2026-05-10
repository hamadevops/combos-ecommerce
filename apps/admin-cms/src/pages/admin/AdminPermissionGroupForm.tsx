import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCreatePermissionGroup, useUpdatePermissionGroup, usePermissionGroups } from "@/hooks/useRoles";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { PermissionEnum } from "@/constants/permissions";

const schema = yup.object().shape({
  name: yup.string().required("Tên nhóm quyền là bắt buộc"),
  key: yup
    .string()
    .required("Mã Key là bắt buộc")
    .matches(/^[a-z0-9_\.]+$/, "Key chỉ được chứa chữ thường, số, dấu chấm và dấu gạch dưới"),
  display_order: yup.number().optional().nullable().default(0),
});

type GroupFormData = yup.InferType<typeof schema>;

const AdminPermissionGroupForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { data: groupsResponse, isLoading: isLoadingGroup } = usePermissionGroups();
  const createGroup = useCreatePermissionGroup();
  const updateGroup = useUpdatePermissionGroup();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GroupFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      key: "",
      display_order: 0,
    },
  });

  useEffect(() => {
    if (isEditing && groupsResponse) {
      const rawGroups = (groupsResponse as any)?.data;
      const groups = Array.isArray(rawGroups)
        ? rawGroups
        : Array.isArray(rawGroups?.items)
          ? rawGroups.items
          : [];
      const currentGroup = groups.find((g: any) => g.id === Number(id));
      if (currentGroup) {
        reset({
          name: currentGroup.name,
          key: currentGroup.key,
          display_order: currentGroup.display_order || 0,
        });
      }
    }
  }, [id, isEditing, groupsResponse, reset]);

  const onSubmit = async (data: GroupFormData) => {
    try {
      if (isEditing) {
        await updateGroup.mutateAsync({ id: Number(id), data });
      } else {
        await createGroup.mutateAsync(data);
      }
      navigate("/permission-groups");
    } catch (error) {
      // Error handled in hook
    }
  };

  const isSaving = isSubmitting || createGroup.isPending || updateGroup.isPending;
  const isLoading = isEditing && isLoadingGroup;

  if (isLoading) {
    return (
      <AdminLayout title={isEditing ? "Chỉnh sửa Nhóm Quyền" : "Thêm Nhóm Quyền"}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEditing ? "Chỉnh sửa Nhóm Quyền" : "Thêm Nhóm Quyền"}>
      <PermissionGuard permissions={[PermissionEnum.PERMISSION_CREATE]}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" type="button" asChild>
              <Link to="/permission-groups">
                <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
              </Link>
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isEditing ? "Cập nhật" : "Lưu nhóm quyền"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Thông tin Nhóm Quyền</CardTitle>
                <CardDescription>Cấu hình thông tin cơ bản cho nhóm</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Tên nhóm <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="name"
                        placeholder="VD: Quản lý Sản phẩm"
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
                        placeholder="VD: product"
                        className={errors.key ? "border-red-500" : ""}
                        disabled={isEditing}
                      />
                    )}
                  />
                  {errors.key && <p className="text-xs text-red-500">{errors.key.message}</p>}
                  {isEditing && (
                    <p className="text-xs text-muted-foreground">Bạn không thể sửa mã Key sau khi tạo mới.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_order">
                    Thứ tự hiển thị
                  </Label>
                  <Controller
                    name="display_order"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        id="display_order"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Hướng dẫn</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm text-muted-foreground">
                    <p>
                      <strong>Nhóm Quyền</strong> giúp bạn phân loại và gom nhóm các quyền hạn liên quan đến nhau. 
                      Việc này giúp màn hình gán quyền (Phân vai trò) hiển thị gọn gàng, có tổ chức hơn.
                    </p>
                    <p>Ví dụ bạn có 4 quyền: tạo đơn hàng, sửa đơn hàng, xem đơn hàng, xóa đơn hàng. Bạn có thể gom tất cả vào chung Nhóm quyền "Quản lý Đơn Hàng" với mã key `order`.</p>
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

export default AdminPermissionGroupForm;
