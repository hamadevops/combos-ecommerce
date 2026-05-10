import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { mockPages } from "@/data/mockPages";
import { toast } from "sonner";
import { ArrowLeft, Save, Globe } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ImageUpload } from "@/components/common/ImageUpload";
import { generateSlug } from "@/lib/utils";

// Define validation schema
const schema = yup.object().shape({
  title: yup.string().required("Tiêu đề trang là bắt buộc"),
  slug: yup
    .string()
    .required("Đường dẫn (Slug) là bắt buộc")
    .matches(/^[a-z0-9-]+$/, "Slug chỉ chứa chữ thường, số và gạch ngang"),
  content: yup.string().optional(),
  status: yup.string().oneOf(["published", "draft"]).default("published"),
  metaTitle: yup.string().optional(),
  metaDescription: yup.string().optional(),
  metaKeywords: yup.string().optional(),
  metaImage: yup.mixed<string | File>().optional(),
});

type PageFormData = yup.InferType<typeof schema>;

const AdminPageForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PageFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      status: "published",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      metaImage: "",
    },
  });

  const slug = watch("slug");
  const status = watch("status");
  const title = watch("title");

  // Auto-generate slug from title if in create mode and slug is untouched
  // Logic: Simple effect for now.
  useEffect(() => {
    if (!isEditing && title && !slug) {
      const generatedSlug = title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
        .trim()
        .replace(/\s+/g, "-"); // Replace spaces with hyphens
      setValue("slug", generatedSlug);
    }
  }, [title, isEditing, slug, setValue]);

  useEffect(() => {
    if (isEditing) {
      const page = mockPages.find((p) => p.id === id);
      if (page) {
        reset({
          title: page.title,
          slug: page.slug,
          content: page.content,
          status: page.status as "published" | "draft", // Type assertion for mock data
          metaTitle: page.metaTitle,
          metaDescription: page.metaDescription,
          metaKeywords: page.metaKeywords,
          metaImage: page.metaImage,
        });
      } else {
        toast.error("Không tìm thấy trang");
        navigate("/pages");
      }
    }
  }, [id, isEditing, navigate, reset]);

  const onSubmit = (data: PageFormData) => {
    console.log("Saving page:", data);
    toast.success(isEditing ? "Đã cập nhật trang" : "Đã tạo trang mới");
    navigate("/pages");
  };

  return (
    <AdminLayout title={isEditing ? "Chỉnh sửa trang" : "Thêm trang mới"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Button variant="outline" type="button" asChild>
            <Link to="/pages">
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            {slug && (
              <Button
                variant="outline"
                type="button"
                onClick={() => window.open(`/${slug}`, "_blank")}
              >
                <Globe className="mr-2 h-4 w-4" /> Xem trang
              </Button>
            )}
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" /> {isEditing ? "Cập nhật" : "Tạo trang"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <Tabs defaultValue="content" className="w-full">
                <CardHeader>
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="content">Nội dung</TabsTrigger>
                    <TabsTrigger value="seo">Cấu hình SEO</TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent className="pt-0">
                  <TabsContent value="content" className="mt-0 space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-lg font-semibold">
                        Tiêu đề trang <span className="text-red-500">*</span>
                      </Label>
                      <Controller
                        name="title"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="title"
                            className={`text-lg p-6 ${errors.title ? "border-red-500" : ""}`}
                            placeholder="Nhập tiêu đề trang..."
                          />
                        )}
                      />
                      {errors.title && (
                        <p className="text-xs text-red-500">{errors.title.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Nội dung</Label>
                      <Controller
                        name="content"
                        control={control}
                        render={({ field }) => (
                          <RichTextEditor
                            value={field.value || ""}
                            onChange={field.onChange}
                            minHeight="500px"
                          />
                        )}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="seo" className="mt-0 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="metaTitle">Meta Title</Label>
                      <Controller
                        name="metaTitle"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="metaTitle"
                            placeholder="Tiêu đề hiển thị trên Google (Mặc định: Tiêu đề trang)"
                            value={field.value || ""}
                          />
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="metaDescription">Meta Description</Label>
                      <Controller
                        name="metaDescription"
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            id="metaDescription"
                            rows={4}
                            placeholder="Mô tả ngắn gọn hiển thị trên kết quả tìm kiếm..."
                            value={field.value || ""}
                          />
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="metaKeywords">Meta Keywords</Label>
                      <Controller
                        name="metaKeywords"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="metaKeywords"
                            placeholder="tu-khoa-1, tu-khoa-2"
                            value={field.value || ""}
                          />
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="metaImage">Meta Image (OG Image)</Label>
                      <Controller
                        name="metaImage"
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
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thông tin chung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="slug">
                    Đường dẫn (Slug) <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="slug"
                    control={control}
                    render={({ field }) => (
                      <div className="flex gap-2">
                        <Input
                          {...field}
                          id="slug"
                          placeholder="tu-dong-theo-tieu-de"
                          className={errors.slug ? "border-red-500" : ""}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          title="Tạo slug từ tên"
                          onClick={() => {
                            const title = watch("title");
                            if (title) {
                              setValue("slug", generateSlug(title));
                            }
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-refresh-cw"
                          >
                            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                            <path d="M21 3v5h-5" />
                            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                            <path d="M3 21v-5h5" />
                          </svg>
                        </Button>
                      </div>
                    )}
                  />
                  {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
                  <p className="text-xs text-muted-foreground">example.com/{slug}</p>
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <Label htmlFor="status">Trạng thái</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {status === "published" ? "Công khai" : "Nháp"}
                    </span>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          id="status"
                          checked={field.value === "published"}
                          onCheckedChange={(checked) =>
                            field.onChange(checked ? "published" : "draft")
                          }
                        />
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminPageForm;
