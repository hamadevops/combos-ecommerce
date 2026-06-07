/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Save, Star } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ImageUpload } from "@/components/common/ImageUpload";
import {
  useAppFeedback,
  useCreateAppFeedback,
  useUpdateAppFeedback,
} from "@/hooks/useAppFeedbacks";
import { uploadApi } from "@/api/upload";

// Validation schema
const schema = yup.object().shape({
  customerName: yup.string().required("Tên khách hàng là bắt buộc"),
  customerAvatar: yup.mixed<string | File>().nullable().optional(),
  content: yup.string().required("Nội dung đánh giá là bắt buộc"),
  rating: yup
    .number()
    .typeError("Số sao phải là số")
    .min(1, "Số sao tối thiểu là 1")
    .max(5, "Số sao tối đa là 5")
    .required()
    .default(5),
  image: yup.mixed<string | File>().nullable().optional(),
  isActive: yup.boolean().default(true),
  sortOrder: yup.number().typeError("Thứ tự hiển thị phải là số").required().default(0),
});

type FeedbackFormData = yup.InferType<typeof schema>;

const AdminAppFeedbackForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries & Mutations
  const { data: feedbackData, isLoading: isLoadingFeedback } = useAppFeedback(Number(id));
  const createFeedback = useCreateAppFeedback();
  const updateFeedback = useUpdateAppFeedback();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      customerName: "",
      customerAvatar: null,
      content: "",
      rating: 5,
      image: null,
      isActive: true,
      sortOrder: 0,
    },
  });

  const rating = watch("rating");
  const isActive = watch("isActive");

  // Load existing data when editing
  useEffect(() => {
    if (isEditing && feedbackData) {
      // Direct assignment from backend response
      const data = (feedbackData as any).data || feedbackData;
      reset({
        customerName: data.customerName || "",
        customerAvatar: data.customerAvatar || null,
        content: data.content || "",
        rating: data.rating || 5,
        image: data.image || null,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      });
    }
  }, [feedbackData, isEditing, reset]);

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    try {
      let avatarUrl = "";
      let screenshotUrl = "";

      // 1. Upload avatar if it's a File
      if (data.customerAvatar instanceof File) {
        avatarUrl = await uploadApi.uploadFile(data.customerAvatar);
      } else if (typeof data.customerAvatar === "string") {
        avatarUrl = data.customerAvatar;
      }

      // 2. Upload screenshot if it's a File
      if (data.image instanceof File) {
        screenshotUrl = await uploadApi.uploadFile(data.image);
      } else if (typeof data.image === "string") {
        screenshotUrl = data.image;
      }

      // Build payload
      const payload = {
        customerName: data.customerName,
        customerAvatar: avatarUrl || undefined,
        content: data.content,
        rating: data.rating,
        image: screenshotUrl || undefined,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      };

      if (isEditing) {
        await updateFeedback.mutateAsync({ id: Number(id), data: payload });
        toast.success("Cập nhật đánh giá thành công");
      } else {
        await createFeedback.mutateAsync(payload);
        toast.success("Tạo đánh giá mới thành công");
      }
      navigate("/app-feedbacks");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Lỗi khi lưu dữ liệu");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditing && isLoadingFeedback) {
    return (
      <AdminLayout title="Chỉnh sửa đánh giá">
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          Đang tải thông tin đánh giá...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEditing ? "Chỉnh sửa đánh giá" : "Thêm đánh giá mới"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Button variant="outline" type="button" asChild>
            <Link to="/app-feedbacks">
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
            </Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />{" "}
            {isSubmitting ? "Đang lưu..." : isEditing ? "Cập nhật" : "Lưu đánh giá"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Nội dung đánh giá</CardTitle>
                <CardDescription>Thông tin phản hồi từ khách hàng</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">
                    Tên khách hàng <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="customerName"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="customerName"
                        placeholder="VD: Nguyễn Văn A, Trần Thị B..."
                      />
                    )}
                  />
                  {errors.customerName && (
                    <p className="text-xs text-red-500">{errors.customerName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">
                    Ý kiến phản hồi <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="content"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        id="content"
                        placeholder="Nhập nội dung đánh giá của khách hàng..."
                        rows={4}
                      />
                    )}
                  />
                  {errors.content && (
                    <p className="text-xs text-red-500">{errors.content.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Số sao đánh giá</Label>
                  <div className="flex items-center gap-1.5 pt-1">
                    {Array.from({ length: 5 }).map((_, idx) => {
                      const starValue = idx + 1;
                      return (
                        <button
                          key={idx}
                          type="button"
                          className="hover:scale-110 transition-transform focus:outline-none"
                          onClick={() => setValue("rating", starValue)}
                        >
                          <Star
                            className={`h-7 w-7 ${
                              starValue <= rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  {errors.rating && (
                    <p className="text-xs text-red-500">{errors.rating.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ảnh đính kèm</CardTitle>
                <CardDescription>
                  Hình ảnh minh họa, ảnh chụp màn hình phản hồi (nếu có)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Controller
                  name="image"
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
          </div>

          {/* Sidebar configurations */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ảnh đại diện</CardTitle>
                <CardDescription>Avatar khách hàng</CardDescription>
              </CardHeader>
              <CardContent>
                <Controller
                  name="customerAvatar"
                  control={control}
                  render={({ field }) => (
                    <ImageUpload
                      value={field.value as any}
                      onChange={field.onChange}
                      multiple={false}
                      maxFiles={1}
                      compact
                    />
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thiết lập hiển thị</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Thứ tự sắp xếp</Label>
                  <Controller
                    name="sortOrder"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        id="sortOrder"
                        onChange={(e) =>
                          field.onChange(e.target.value ? parseInt(e.target.value) : 0)
                        }
                      />
                    )}
                  />
                  {errors.sortOrder && (
                    <p className="text-xs text-red-500">{errors.sortOrder.message}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground">
                    Số lớn hơn sẽ được sắp xếp lên trước.
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4">
                  <Label htmlFor="isActive">Hiển thị đánh giá</Label>
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="isActive"
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

export default AdminAppFeedbackForm;
