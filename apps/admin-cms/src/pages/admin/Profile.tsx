import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useUserStore } from "@/store/useUserStore";
import {
  Camera,
  Save,
  User as UserIcon,
  Mail,
  Shield,
  Key,
  Image as ImageIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/auth";
import { userApi } from "@/api/user";
import { UpdateUserDto, ProfileUpdateDto } from "@/types/user";
import { getImageUrl } from "@/lib/utils";

// Schema for Profile Info
const profileInfoSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự").max(255, "Tên không được quá 255 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  bio: z.string().max(500, "Giới thiệu không được quá 500 ký tự").optional(),
  phone: z.string().max(20, "Số điện thoại không được quá 20 ký tự").optional(),
});

// Schema for Password Change
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

const AdminProfile = () => {
  const queryClient = useQueryClient();
  const { user, setUser } = useUserStore();

  // File upload refs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [coverImage, setCoverImage] = useState(
    getImageUrl(user?.background) ||
      "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=2029&ixlib=rb-4.0.3",
  );
  const [avatarImage, setAvatarImage] = useState(getImageUrl(user?.avatar));

  // Upload confirmation state
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<"avatar" | "cover" | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form hooks
  const infoForm = useForm<z.infer<typeof profileInfoSchema>>({
    resolver: zodResolver(profileInfoSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      bio: user?.bio || "",
      phone: user?.phone || "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Reset form when user data changes (e.g. after load or update)
  useEffect(() => {
    if (user) {
      infoForm.reset({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        phone: user.phone || "",
      });
      // Also update images state if they haven't been modified locally
      // actually better to just rely on user updates unless we want to keep previews.
      // But for simple sync:
      setAvatarImage(getImageUrl(user.avatar));
      setCoverImage(
        getImageUrl(user.background) ||
          "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=2029&ixlib=rb-4.0.3",
      );
    }
  }, [user, infoForm]);

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileUpdateDto) => {
      return userApi.updateProfile(data);
    },
    onSuccess: (response: any) => {
      // Check if response has data property (axios wrapper) or is direct data
      const userData = response.data || response;

      toast.success("Đã cập nhật thông tin hồ sơ");
      setUser(userData);
      setAvatarImage(getImageUrl(userData.avatar));
      setCoverImage(getImageUrl(userData.background) || coverImage);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Cập nhật thất bại");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: any) => authApi.changePassword(data),
    onSuccess: () => {
      toast.success("Đã đổi mật khẩu thành công");
      passwordForm.reset();
    },
    onError: (error: any) => {
      toast.error(error.message || "Đổi mật khẩu thất bại");
    },
  });

  const onInfoSubmit = (values: z.infer<typeof profileInfoSchema>) => {
    updateProfileMutation.mutate({
      name: values.name,
      bio: values.bio,
      phone: values.phone,
    });
  };

  const onPasswordSubmit = (values: z.infer<typeof passwordSchema>) => {
    changePasswordMutation.mutate({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
      confirmPassword: values.confirmPassword,
    });
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "cover",
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      setUploadFile(file);
      setUploadType(type);
      setIsDialogOpen(true);
      event.target.value = "";
    }
  };

  const handleConfirmUpload = () => {
    if (uploadFile && uploadType) {
      let mutationPromise;

      if (uploadType === "avatar") {
        mutationPromise = userApi.uploadAvatar(uploadFile);
      } else {
        mutationPromise = userApi.uploadBackground(uploadFile);
      }

      // Manually trigger mutation or create a new wrapper?
      // Since updateProfileMutation expects UpdateUserDto, we should probably just call the API directly
      // and use the onSuccess logic, OR create a separate mutation for file uploads.
      // Reusing the existing wrapper is tricky because of the signature.
      // Let's call the API directly and handle success/error here for simplicity,
      // or better, create `uploadMutation`.

      mutationPromise
        .then((response: any) => {
          const userData = response.data || response;
          toast.success("Đã cập nhật ảnh thành công");
          setUser(userData);
          setAvatarImage(getImageUrl(userData.avatar));
          setCoverImage(getImageUrl(userData.background) || coverImage);
          queryClient.invalidateQueries({ queryKey: ["profile"] });

          setIsDialogOpen(false);
          setPreviewImage(null);
          setUploadType(null);
          setUploadFile(null);
        })
        .catch((error: any) => {
          toast.error(error.message || "Cập nhật ảnh thất bại");
        });
    }
  };

  if (!user) return null;

  return (
    <AdminLayout title="Hồ sơ cá nhân">
      <div className="space-y-6">
        {/* Helper Inputs for File Upload */}
        <input
          type="file"
          ref={avatarInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => handleFileChange(e, "avatar")}
        />
        <input
          type="file"
          ref={coverInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => handleFileChange(e, "cover")}
        />

        {/* Profile Header Block */}
        <div className="relative rounded-xl overflow-hidden bg-card border shadow-sm">
          {/* Cover Image */}
          <div className="h-48 md:h-64 bg-muted relative group">
            <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => coverInputRef.current?.click()}
            >
              <ImageIcon className="mr-2 h-4 w-4" /> Thay đổi ảnh bìa
            </Button>
          </div>

          {/* Profile Info & Avatar */}
          <div className="px-6 pb-6 pt-0 relative">
            <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 md:-mt-16 mb-4 gap-4">
              {/* Avatar */}
              <div
                className="relative group cursor-pointer"
                onClick={() => avatarInputRef.current?.click()}
              >
                <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-card shadow-md transition-opacity group-hover:opacity-90">
                  <AvatarImage src={avatarImage} alt={user.name} />
                  <AvatarFallback className="text-4xl">
                    {user.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-8 w-8 text-white" />
                </div>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 rounded-full h-8 w-8 shadow-sm border border-border md:hidden"
                  onClick={(e) => {
                    e.stopPropagation();
                    avatarInputRef.current?.click();
                  }}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              {/* Name & Role */}
              <div className="flex-1 pt-2 md:pt-0 md:pb-2">
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {user.email}
                  </span>
                  <span>•</span>
                  <Badge variant="secondary" className="px-2 py-0 h-5 text-xs">
                    <Shield className="mr-1 h-3 w-3" />
                    {user.role?.name || "Admin"}
                  </Badge>
                </div>
                {/* Bio Display */}
                {user.bio && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2 max-w-2xl">
                    {user.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column - Additional Info */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thông tin hệ thống</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-medium">#{user.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Ngày tạo tài khoản:</span>
                  <span className="font-medium">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Trạng thái:</span>
                  <Badge variant="default">Hoạt động</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thống kê hoạt động</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Bài viết đã đăng:</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Sản phẩm quản lý:</span>
                  <span className="font-medium">45</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Separated Forms */}
          <div className="md:col-span-2 space-y-6">
            {/* 1. General Information Form */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
                <CardDescription>Cập nhật thông tin công khai của bạn.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...infoForm}>
                  <form onSubmit={infoForm.handleSubmit(onInfoSubmit)} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={infoForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Họ và tên</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input className="pl-9" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={infoForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input className="pl-9" {...field} disabled={true} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={infoForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Số điện thoại</FormLabel>
                            <FormControl>
                              <Input placeholder="+84 ..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={infoForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Giới thiệu (Bio)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Hãy giới thiệu đôi chút về bản thân bạn..."
                              className="resize-none min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end">
                      <Button type="submit">
                        <Save className="mr-2 h-4 w-4" /> Lưu thông tin
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* 2. Change Password Form */}
            <Card>
              <CardHeader>
                <CardTitle>Đổi mật khẩu</CardTitle>
                <CardDescription>
                  Để bảo mật, vui lòng không chia sẻ mật khẩu của bạn.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form
                    onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mật khẩu hiện tại</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input type="password" className="pl-9" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mật khẩu mới</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input type="password" className="pl-9" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input type="password" className="pl-9" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" variant="outline">
                        <Key className="mr-2 h-4 w-4" /> Đổi mật khẩu
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận thay đổi</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn thay đổi{" "}
                {uploadType === "avatar" ? "ảnh đại diện" : "ảnh bìa"} này không?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className={uploadType === "avatar" ? "flex justify-center" : "w-full"}>
                {previewImage && (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className={
                      uploadType === "avatar"
                        ? "h-40 w-40 rounded-full object-cover border-4 border-muted"
                        : "w-full h-48 object-cover rounded-md border"
                    }
                  />
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy bỏ
              </Button>
              <Button onClick={handleConfirmUpload}>Xác nhận</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;
