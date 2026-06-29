import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { mockFaqs, FAQ } from "@/data/mockFaqs";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Define validation schema
const schema = yup.object().shape({
  question: yup.string().required("Câu hỏi là bắt buộc"),
  answer: yup.string().required("Câu trả lời là bắt buộc"),
  order: yup.number().typeError("Thứ tự phải là số").required().default(1),
  isActive: yup.boolean().default(true),
});

type FaqFormData = yup.InferType<typeof schema>;

const AdminFaqForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<FaqFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      question: "",
      answer: "",
      order: 1,
      isActive: true,
    },
  });

  const isActive = watch("isActive");

  useEffect(() => {
    if (isEditing) {
      const faq = mockFaqs.find((f) => f.id === id);
      if (faq) {
        reset({
          question: faq.question,
          answer: faq.answer,
          order: faq.order,
          isActive: faq.isActive,
        });
      } else {
        toast.error("Không tìm thấy câu hỏi");
        navigate("/faqs");
      }
    }
  }, [id, isEditing, navigate, reset]);

  const onSubmit = (data: FaqFormData) => {
    console.log("Saving FAQ:", data);
    toast.success(isEditing ? "Đã cập nhật câu hỏi" : "Đã tạo câu hỏi mới");
    navigate("/faqs");
  };

  return (
    <AdminLayout title={isEditing ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Button variant="outline" type="button" asChild>
            <Link to="/faqs">
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
            </Link>
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" /> {isEditing ? "Cập nhật" : "Lưu lại"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Nội dung câu hỏi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="question">Câu hỏi</Label>
                  <Controller
                    name="question"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="question"
                        className={`text-lg p-6 ${errors.question ? "border-red-500" : ""}`}
                        placeholder="Nhập nội dung câu hỏi..."
                      />
                    )}
                  />
                  {errors.question && (
                    <p className="text-xs text-red-500">{errors.question.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Câu trả lời</Label>
                  <Controller
                    name="answer"
                    control={control}
                    render={({ field }) => (
                      <RichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                        minHeight={300}
                        placeholder="Nhập câu trả lời chi tiết..."
                      />
                    )}
                  />
                  {errors.answer && <p className="text-xs text-red-500">{errors.answer.message}</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thiết lập chung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="order">Thứ tự hiển thị</Label>
                  <Controller
                    name="order"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        id="order"
                        onChange={(e) =>
                          field.onChange(e.target.value ? parseInt(e.target.value) : "")
                        }
                      />
                    )}
                  />
                  {errors.order && <p className="text-xs text-red-500">{errors.order.message}</p>}
                  <p className="text-xs text-muted-foreground">Số nhỏ hơn sẽ hiển thị trước</p>
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <Label htmlFor="active">Trạng thái</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{isActive ? "Hiển thị" : "Ẩn"}</span>
                    <Controller
                      name="isActive"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          id="active"
                          checked={field.value}
                          onCheckedChange={field.onChange}
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

export default AdminFaqForm;
