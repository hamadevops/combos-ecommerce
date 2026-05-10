import { useEffect } from "react";

import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { BlogSeoTab } from "@/components/admin/blog/BlogSeoTab";
import { ImageUpload } from "@/components/common/ImageUpload";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { generateSlug, formatDate } from "@/lib/utils";
import { MultiSelect } from "@/components/ui/multi-select";
// Hooks
import { usePost, useCreatePost, useUpdatePost } from "@/hooks/usePosts";
import { useTopics } from "@/hooks/useTopics";
import { useTags } from "@/hooks/useTags";

// Validation schema
const schema = yup.object().shape({
  title: yup.string().required("Tiêu đề bài viết là bắt buộc"),
  slug: yup
    .string()
    .required("Slug (URL) là bắt buộc")
    .matches(/^[a-z0-9-]+$/, "Slug chỉ chứa chữ thường, số và gạch ngang"),
  excerpt: yup.string().optional(),
  content: yup.string().required("Nội dung bài viết là bắt buộc"),
  thumbnail: yup.mixed<string | File>().optional(),
  topicId: yup.string().required("Vui lòng chọn chủ đề"),
  // tags is now array of strings (Ids) or objects? MultiSelect usually returns array of strings (values).
  // Our backend expects array of numbers (IDs).
  // Let's assume MultiSelect returns array of strings, we convert to numbers later.
  tags: yup.array().of(yup.string()).optional(),
  publishedAt: yup.string().optional(),
  isPublished: yup.boolean().default(false),
  metaTitle: yup.string().optional(),
  metaDescription: yup.string().optional(),
  metaKeywords: yup.string().optional(),
});

type BlogFormData = yup.InferType<typeof schema>;

const AdminBlogForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  // Queries
  const { data: postResponse, isLoading: isLoadingPost } = usePost(Number(id));
  const { data: topicsData } = useTopics(); // Assuming it returns tree or list.
  // topicApi.getTree returns { data: Topic[] }. We need flattened list for select? or just children?
  // Standard Select only supports flat list. We might need to flatten or just show top level?
  // Let's flatten for now or just map available ones.
  const { data: tagsData } = useTags({ limit: 100 });

  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  // Prepare options
  const topics = topicsData?.data || [];
  // Helper to flatten topics for dropdown (similar to Topics.tsx)
  const flattenTopics = (topics: any[], level = 0, result: any[] = []) => {
    topics.forEach((cat) => {
      result.push({ ...cat, level });
      if (cat.children && cat.children.length > 0) {
        flattenTopics(cat.children, level + 1, result);
      }
    });
    return result;
  };
  const topicOptions = flattenTopics(topics);

  const tags = tagsData?.data || [];
  const tagOptions = tags.map((t) => ({ label: t.name, value: String(t.id) }));

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm<BlogFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      thumbnail: "",
      topicId: "",
      tags: [],
      isPublished: false,
      publishedAt: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
    },
  });

  const isPublished = watch("isPublished");
  const title = watch("title");
  const slug = watch("slug");

  // Auto-generate slug
  useEffect(() => {
    if (!isEditing && title && !slug) {
      setValue("slug", generateSlug(title));
    }
  }, [title, isEditing, slug, setValue]);

  // Load data on edit - wait for both post and topics to be ready to ensure Select has options
  useEffect(() => {
    if (isEditing && postResponse?.data && topicsData?.data) {
      const post = postResponse.data;
      const currentTopicId = post.topics && post.topics.length > 0 ? String(post.topics[0].id) : "";

      reset({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || "",
        content: post.content || "",
        thumbnail: post.thumbnail || "",
        topicId: currentTopicId,
        tags: post.tags ? post.tags.map((t) => String(t.id)) : [],
        isPublished: post.isPublished,
        // Convert UTC to local time for datetime-local input
        publishedAt: post.publishedAt ? formatDate(post.publishedAt, "yyyy-MM-dd'T'HH:mm") : "",
        metaTitle: post.metaTitle || "",
        metaDescription: post.metaDescription || "",
        metaKeywords: post.metaKeywords || "",
      });
    }
  }, [isEditing, postResponse, topicsData, reset]);

  const onSubmit = (data: BlogFormData) => {
    const payload: any = {
      ...data,
      topic_ids: data.topicId ? [String(data.topicId)] : [],
      tag_ids: data.tags ? data.tags.map((t) => String(t)) : [],
      is_active: true,
      is_published: data.isPublished,
      // Convert local time back to UTC ISO string
      published_at: data.publishedAt ? new Date(data.publishedAt).toISOString() : undefined,
      meta_title: data.metaTitle,
      meta_description: data.metaDescription,
      meta_keywords: data.metaKeywords,
    };

    // Remove derived/unwanted fields from spread
    delete payload.topicId;
    delete payload.tags; // payload uses tag_ids
    delete payload.isPublished; // payload uses is_published
    delete payload.publishedAt; // payload uses published_at
    delete payload.metaTitle;
    delete payload.metaDescription;
    delete payload.metaKeywords;

    if (isEditing) {
      updatePost.mutate({ id: Number(id), data: payload });
    } else {
      createPost.mutate(payload, {
        onSuccess: () => navigate("/blog"),
      });
    }
  };

  const handlePreview = () => {
    const formData = watch();
    // Clone data to avoid mutating form state
    const previewData: any = { ...formData };

    // Handle thumbnail if it is a File (newly selected but not uploaded/saved yet)
    if (previewData.thumbnail instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        previewData.thumbnail = reader.result as string; // Base64 string
        localStorage.setItem("preview_post_data", JSON.stringify(previewData));
        window.open("/blog/preview", "_blank");
      };
      reader.readAsDataURL(previewData.thumbnail);
      return;
    }

    localStorage.setItem("preview_post_data", JSON.stringify(previewData));
    window.open("/blog/preview", "_blank");
  };

  if (isEditing && isLoadingPost) {
    return (
      <AdminLayout title="Đang tải...">
        <div className="p-8 text-center">Đang tải dữ liệu...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEditing ? "Chỉnh sửa bài viết" : "Viết bài mới"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold sr-only">
            {isEditing ? "Chỉnh sửa bài viết" : "Viết bài mới"}
          </h1>
          <div className="space-x-2 ml-auto">
            <Button variant="outline" type="button" onClick={handlePreview}>
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
                className="lucide lucide-eye mr-2"
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Xem trước
            </Button>
            <Button variant="outline" type="button" onClick={() => navigate("/blog")}>
              Hủy
            </Button>
            <Button type="submit" disabled={createPost.isPending || updatePost.isPending}>
              {(createPost.isPending || updatePost.isPending) && <span className="mr-2">...</span>}
              {isEditing ? "Cập nhật" : "Đăng bài"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <Tabs defaultValue="content" className="w-full">
                <CardHeader>
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="content">Nội dung</TabsTrigger>
                    <TabsTrigger value="seo">SEO</TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent className="pt-0">
                  <TabsContent value="content" className="mt-0 space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">
                          Tiêu đề bài viết <span className="text-red-500">*</span>
                        </Label>
                        <Controller
                          name="title"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              id="title"
                              placeholder="Nhập tiêu đề..."
                              className={errors.title ? "border-red-500" : ""}
                            />
                          )}
                        />
                        {errors.title && (
                          <p className="text-xs text-red-500">{errors.title.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="slug">
                          Slug (URL) <span className="text-red-500">*</span>
                        </Label>
                        <Controller
                          name="slug"
                          control={control}
                          render={({ field }) => (
                            <div className="flex gap-2">
                              <Input
                                {...field}
                                id="slug"
                                placeholder="tieu-de-bai-viet"
                                className={errors.slug ? "border-red-500" : ""}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                title="Tạo slug từ tiêu đề"
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
                        {errors.slug && (
                          <p className="text-xs text-red-500">{errors.slug.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>
                          Nội dung <span className="text-red-500">*</span>
                        </Label>
                        <Controller
                          name="content"
                          control={control}
                          render={({ field }) => (
                            <RichTextEditor
                              value={field.value || ""}
                              onChange={field.onChange}
                              placeholder="Viết nội dung ở đây..."
                              minHeight={400}
                              maxHeight={800}
                            />
                          )}
                        />
                        {errors.content && (
                          <p className="text-xs text-red-500">{errors.content.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="excerpt">Mô tả ngắn (Excerpt)</Label>
                        <Controller
                          name="excerpt"
                          control={control}
                          render={({ field }) => (
                            <Textarea
                              {...field}
                              id="excerpt"
                              rows={3}
                              placeholder="Mô tả sẽ hiển thị ở trang danh sách..."
                              value={field.value || ""}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="seo" className="mt-0">
                    <BlogSeoTab control={control} />
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Right Column: Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thông tin chung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Trạng thái</Label>
                  <Controller
                    name="isPublished"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ? "published" : "draft"}
                        onValueChange={(val) => field.onChange(val === "published")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Bản nháp (Draft)</SelectItem>
                          <SelectItem value="published">Công khai (Public)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Ngày xuất bản</Label>
                  <Controller
                    name="publishedAt"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="datetime-local" value={field.value || ""} />
                    )}
                  />
                  <p className="text-xs text-muted-foreground">Để trống nếu muốn xuất bản ngay.</p>
                </div>

                <div className="space-y-2">
                  <Label>
                    Chủ đề (Topic) <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="topicId"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className={errors.topicId ? "border-red-500" : ""}>
                          <SelectValue placeholder="Chọn chủ đề" />
                        </SelectTrigger>
                        <SelectContent>
                          {topicOptions.map((topic) => (
                            <SelectItem
                              key={topic.id}
                              value={String(topic.id)}
                              style={{ paddingLeft: `${topic.level * 20 + 32}px` }}
                            >
                              {topic.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.topicId && (
                    <p className="text-xs text-red-500">{errors.topicId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Thẻ (Tags)</Label>
                  <Controller
                    name="tags"
                    control={control}
                    render={({ field }) => (
                      <MultiSelect
                        options={tagOptions}
                        selected={field.value || []}
                        onChange={field.onChange}
                        placeholder="Chọn thẻ..."
                        className="w-full"
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Thumbnail URL</Label>
                  <Controller
                    name="thumbnail"
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
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminBlogForm;
