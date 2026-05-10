import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/common/ImageUpload";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { userApi } from "@/api/user";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

// Fetch roles from API
const useRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: () => apiClient.get<any>("/roles"),
  });
};

// Define validation schema
const schema = yup.object().shape({
  name: yup.string().required("Họ và tên là bắt buộc"),
  email: yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
  avatar: yup.mixed<string | File>().nullable().optional(),
  background: yup.mixed<string | File>().nullable().optional(),
  roleId: yup.number().required("Vui lòng chọn vai trò"),
  password: yup.string().when("$isEditing", {
    is: false,
    then: (schema) => schema.required("Mật khẩu là bắt buộc").min(6, "Mật khẩu tối thiểu 6 ký tự"),
    otherwise: (schema) => schema.nullable(),
  }),
  bio: yup.string().nullable(),
});

type UserFormData = yup.InferType<typeof schema>;

const AdminUserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: rolesResponse, isLoading: isLoadingRoles } = useRoles();
  const roles = useMemo(() => rolesResponse?.data || [], [rolesResponse]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<UserFormData>({
    resolver: yupResolver(schema),
    context: { isEditing },
    defaultValues: {
      name: "",
      email: "",
      avatar: "",
      background: "",
      roleId: undefined,
      password: "",
      bio: "",
    },
  });

  const currentRoleId = watch("roleId");

  // Fetch user data when editing
  useEffect(() => {
    if (isEditing && id) {
      userApi
        .getOne(Number(id))
        .then((response: any) => {
          const user = response?.data;
          if (user) {
            reset({
              name: user.name,
              email: user.email,
              avatar: user.avatar || "",
              background: user.background || "",
              roleId: user.role?.id,
              bio: user.bio || "",
            });
          }
        })
        .catch(() => {
          toast.error("Không tìm thấy thành viên");
          navigate("/users");
        });
    }
  }, [id, isEditing, navigate, reset]);

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await userApi.update(Number(id), {
          name: data.name,
          email: data.email,
          roleId: data.roleId,
          bio: data.bio || undefined,
          avatar: data.avatar instanceof File ? data.avatar : undefined,
          background: data.background instanceof File ? data.background : undefined,
          ...(data.password && { password: data.password }),
        });
        toast.success("Đã cập nhật thành viên");
      } else {
        await userApi.create({
          name: data.name,
          email: data.email,
          password: data.password!,
          roleId: data.roleId,
          bio: data.bio || undefined,
          avatar: data.avatar instanceof File ? data.avatar : undefined,
          background: data.background instanceof File ? data.background : undefined,
        });
        toast.success("Đã thêm thành viên mới");
      }
      queryClient.invalidateQueries({ queryKey: ["users"] });
      navigate("/users");
    } catch (err: any) {
      toast.error(err?.message || "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title={isEditing ? "Chỉnh sửa thành viên" : "Thêm thành viên mới"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Button variant="outline" type="button" asChild>
            <Link to="/users">
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
            </Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isEditing ? "Cập nhật" : "Tạo mới"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Ảnh đại diện</Label>
                    <div className="max-w-[200px]">
                      <Controller
                        name="avatar"
                        control={control}
                        render={({ field }) => (
                          <ImageUpload
                            value={field.value}
                            onChange={field.onChange}
                            multiple={false}
                            maxFiles={1}
                          />
                        )}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Ảnh nền (Background)</Label>
                    <Controller
                      name="background"
                      control={control}
                      render={({ field }) => (
                        <ImageUpload
                          value={field.value}
                          onChange={field.onChange}
                          multiple={false}
                          maxFiles={1}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Họ và tên <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="name"
                          placeholder="Nguyễn Văn A"
                          className={errors.name ? "border-red-500" : ""}
                        />
                      )}
                    />
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Giới thiệu</Label>
                    <Controller
                      name="bio"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="bio"
                          value={field.value || ""}
                          placeholder="Mô tả ngắn..."
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="email"
                        type="email"
                        placeholder="user@example.com"
                        disabled={isEditing}
                        className={errors.email ? "border-red-500" : ""}
                      />
                    )}
                  />
                  {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    Mật khẩu {!isEditing && <span className="text-red-500">*</span>}
                  </Label>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="password"
                        type="password"
                        placeholder={isEditing ? "Để trống nếu không đổi" : "Nhập mật khẩu"}
                        value={field.value || ""}
                        className={errors.password ? "border-red-500" : ""}
                      />
                    )}
                  />
                  {errors.password && (
                    <p className="text-xs text-red-500">{errors.password.message}</p>
                  )}
                  {isEditing && (
                    <p className="text-xs text-muted-foreground">
                      Để trống nếu không muốn thay đổi mật khẩu.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Phân quyền</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role">
                    Vai trò (Role) <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="roleId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value?.toString() ?? ""}
                        onValueChange={(val) => field.onChange(Number(val))}
                        disabled={isLoadingRoles}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={isLoadingRoles ? "Đang tải..." : "Chọn vai trò"}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role: any) => (
                            <SelectItem key={role.id} value={role.id.toString()}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.roleId && <p className="text-xs text-red-500">{errors.roleId.message}</p>}
                  <p className="text-xs text-muted-foreground">
                    {roles.find((r: any) => r.id === currentRoleId)?.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminUserForm;
