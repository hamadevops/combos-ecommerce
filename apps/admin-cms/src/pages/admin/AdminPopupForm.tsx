import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ImageUpload } from "@/components/common/ImageUpload";
import { usePopups, useCreatePopup, useUpdatePopup } from "@/hooks/usePopups";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = yup.object().shape({
  title: yup.string().optional(),
  description: yup.string().optional(),
  image_url: yup.mixed<string | File>().optional(),
  link: yup.string().url("Đường dẫn không hợp lệ").optional(),
  position: yup.string().oneOf(["CENTER", "FOOTER", "SIDEBAR"]).default("CENTER"),
  promo_code: yup.string().optional(),
  is_active: yup.boolean().default(true),
});

type PopupFormData = yup.InferType<typeof schema>;

const AdminPopupForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { data: popupsResponse } = usePopups();
  const popups = popupsResponse?.data || popupsResponse || [];
  const createPopup = useCreatePopup();
  const updatePopup = useUpdatePopup();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PopupFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      image_url: "",
      link: "",
      position: "CENTER",
      promo_code: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (isEditing && popups.length > 0) {
      const popup = popups.find((p: any) => p.id === Number(id));
      if (popup) {
        reset({
          title: popup.title || "",
          description: popup.description || "",
          image_url: popup.image_url || "",
          link: popup.link || "",
          position: popup.position || "CENTER",
          promo_code: popup.promo_code || "",
          is_active: popup.is_active ?? true,
        });
      } else {
        toast.error("Không tìm thấy popup");
        navigate("/popups");
      }
    }
  }, [id, isEditing, navigate, reset, popups]);

  const onSubmit = (data: PopupFormData) => {
    // Convert to match CreatePopupDto / UpdatePopupDto API payload
    // The generator might require 'image' as File instead of 'image_url' or something based on formData rules.
    // Assuming your backend uses exact keys for Popup.
    const payload: any = {
      title: data.title,
      description: data.description,
      link: data.link,
      position: data.position,
      promo_code: data.promo_code,
      is_active: data.is_active,
    };

    if (data.image_url instanceof File) {
      payload.image = data.image_url;
    } else if (typeof data.image_url === "string" && data.image_url) {
      payload.image_url = data.image_url;
    }

    if (isEditing) {
      updatePopup.mutate(
        { id: Number(id), data: payload },
        {
          onSuccess: () => navigate("/popups"),
        },
      );
    } else {
      createPopup.mutate(payload, {
        onSuccess: () => navigate("/popups"),
      });
    }
  };

  return (
    <AdminLayout title={isEditing ? "Chỉnh sửa Popup" : "Thêm Popup mới"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Button variant="outline" type="button" asChild>
            <Link to="/popups">
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
            </Link>
          </Button>
          <Button type="submit" disabled={createPopup.isPending || updatePopup.isPending}>
            <Save className="mr-2 h-4 w-4" /> {isEditing ? "Cập nhật" : "Tạo Popup"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Nội dung hiển thị</CardTitle>
                <CardDescription>Thông tin hiển thị trên Popup</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Tiêu đề (tuỳ chọn)</Label>
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} id="title" placeholder="Khuyến mãi hè 50%!" />
                    )}
                  />
                  {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả (tuỳ chọn)</Label>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        id="description"
                        placeholder="Giảm ngay 50% cho tất cả đơn hàng..."
                        rows={3}
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link">Đường dẫn khi click (tuỳ chọn)</Label>
                  <Controller
                    name="link"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} id="link" placeholder="https://example.com/khuyen-mai" />
                    )}
                  />
                  {errors.link && <p className="text-xs text-red-500">{errors.link.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="promo_code">Mã giảm giá để copy (tuỳ chọn)</Label>
                  <Controller
                    name="promo_code"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="promo_code"
                        placeholder="SUMMER50"
                        className="uppercase"
                      />
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hình ảnh</CardTitle>
                <CardDescription>Banner chính của popup</CardDescription>
              </CardHeader>
              <CardContent>
                <Controller
                  name="image_url"
                  control={control}
                  render={({ field }) => (
                    <ImageUpload
                      value={field.value as any}
                      onChange={field.onChange}
                      multiple={false}
                      maxFiles={1}
                    />
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cài đặt hiển thị</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="position">Vị trí hiển thị</Label>
                  <Controller
                    name="position"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn vị trí" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CENTER">Giữa màn hình (Center)</SelectItem>
                          <SelectItem value="FOOTER">Dưới màn hình (Footer)</SelectItem>
                          <SelectItem value="SIDEBAR">Góc bên (Sidebar)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4">
                  <Label htmlFor="is_active">Trạng thái Hoạt động</Label>
                  <Controller
                    name="is_active"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="is_active"
                        checked={field.value}
                        onCheckedChange={field.onChange}
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

export default AdminPopupForm;
