import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useEmTemplate,
  useCreateEmTemplate,
  useUpdateEmTemplate,
  usePreviewEmTemplate,
  useSendTestEmTemplate,
} from "@/hooks/useEmailMarketing";
import { ArrowLeft, Save, Eye, Loader2, Code2, Info, Send, X } from "lucide-react";
import { toast } from "sonner";

const TEMPLATE_VARIABLES = [
  { var: "{contact.firstName}", label: "Tên" },
  { var: "{contact.lastName}", label: "Họ" },
  { var: "{contact.email}", label: "Email" },
  { var: "{contact.company}", label: "Công ty" },
  { var: "{contact.phone}", label: "SĐT" },
];

interface EmTemplate {
  id: number;
  name: string;
  subject: string;
  htmlContent: string;
  previewText?: string;
  updatedAt?: string;
}

export default function EmTemplateForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const templateId = Number(id);

  const { data, isLoading } = useEmTemplate(isEdit ? templateId : 0);
  const template = data as EmTemplate | undefined;
  const createTemplate = useCreateEmTemplate();
  const updateTemplate = useUpdateEmTemplate(templateId);
  const previewTemplate = usePreviewEmTemplate();
  const sendTest = useSendTestEmTemplate(templateId);

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewSubject, setPreviewSubject] = useState("");

  // Load data when editing
  useEffect(() => {
    if (template && isEdit) {
      setName(template.name || "");
      setSubject(template.subject || "");
      setHtmlContent(template.htmlContent || "");
      setPreviewText(template.previewText || "");
    }
  }, [template, isEdit]);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Tên template là bắt buộc");
      return;
    }
    if (!subject.trim()) {
      toast.error("Subject là bắt buộc");
      return;
    }
    if (!htmlContent.trim()) {
      toast.error("Nội dung HTML là bắt buộc");
      return;
    }

    const data = {
      name: name.trim(),
      subject: subject.trim(),
      htmlContent: htmlContent,
      previewText: previewText.trim() || undefined,
    };

    if (isEdit) {
      updateTemplate.mutate(data, {
        onSuccess: () => navigate("/email-marketing/templates"),
      });
    } else {
      createTemplate.mutate(data, {
        onSuccess: () => navigate("/email-marketing/templates"),
      });
    }
  };

  const handlePreview = () => {
    if (!htmlContent) {
      toast.error("Vui lòng nhập nội dung HTML trước");
      return;
    }

    if (isEdit && templateId) {
      previewTemplate.mutate(
        {
          id: templateId,
          data: {
            sampleData: {
              firstName: "John",
              lastName: "Doe",
              email: "john@example.com",
              company: "Acme Corp",
            },
          },
        },
        {
          onSuccess: (data: any) => {
            // Backend might return { data: { html, subject } }
            const resData = data?.data || data;
            setPreviewHtml(resData?.html || htmlContent);
            setPreviewSubject(resData?.subject || subject);
            setPreviewDialogOpen(true);
          },
        },
      );
    } else {
      // For new templates, just show raw HTML
      setPreviewHtml(htmlContent);
      setPreviewSubject(subject);
      setPreviewDialogOpen(true);
    }
  };

  const handleSendTest = () => {
    if (!testEmail) {
      toast.error("Vui lòng nhập email nhận test");
      return;
    }
    sendTest.mutate(testEmail, {
      onSuccess: () => setTestDialogOpen(false),
    });
  };

  const isPending = createTemplate.isPending || updateTemplate.isPending;

  if (isEdit && isLoading) {
    return (
      <AdminLayout title="Template">
        <div className="w-full space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEdit ? "Chỉnh sửa Template" : "Tạo Template mới"}>
      <div className="w-full space-y-4">
        {/* Full-width Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3">
            <Link to="/email-marketing/templates">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h2 className="text-xl font-bold">
                {isEdit ? "Chỉnh sửa Template" : "Tạo Template mới"}
              </h2>
              {isEdit && <p className="text-xs text-muted-foreground mt-0.5">ID: {templateId}</p>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {isEdit && (
              <Button
                variant="outline"
                onClick={() => setTestDialogOpen(true)}
                disabled={sendTest.isPending}
              >
                <Send className="h-4 w-4 mr-1.5" />
                Gửi thử
              </Button>
            )}
            <Button variant="outline" onClick={handlePreview} disabled={previewTemplate.isPending}>
              {previewTemplate.isPending ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Eye className="h-4 w-4 mr-1.5" />
              )}
              Preview
            </Button>
            <Button
              onClick={handleSave}
              disabled={isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1.5" />
              )}
              {isEdit ? "Lưu thay đổi" : "Tạo Template"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main Info Columns */}
          <div className="lg:col-span-9 space-y-4">
            <Card>
              <CardHeader className="pb-3 border-b mb-4">
                <CardTitle className="text-base">Nội dung Email</CardTitle>
                <CardDescription>
                  Thiết lập tiêu đề và nội dung HTML cho email của bạn.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-name" className="text-sm font-semibold">
                      Tên template (Nội bộ) *
                    </Label>
                    <Input
                      id="template-name"
                      placeholder="VD: Welcome Email, Promo Sale..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-slate-50/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template-subject" className="text-sm font-semibold">
                      Subject (Tiêu đề email khách nhận) *
                    </Label>
                    <Input
                      id="template-subject"
                      placeholder="VD: Chào mừng {contact.firstName}!"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="bg-slate-50/50 font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-preview" className="text-sm font-semibold">
                    Preview text{" "}
                    <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
                  </Label>
                  <Input
                    id="template-preview"
                    placeholder="Text hiển thị dưới subject trong inbox..."
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                    className="bg-slate-50/50"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Side-by-side Editor and Live Preview */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 h-[750px] min-h-[600px]">
              <Card className="flex flex-col h-full shadow-md">
                <CardHeader className="py-3 px-4 bg-slate-900 text-white rounded-t-lg">
                  <CardTitle className="text-sm font-mono flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Code2 className="h-4 w-4" />
                      HTML Editor
                    </span>
                    <Badge variant="outline" className="text-[10px] text-white/70 border-white/20">
                      Standard HTML
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <div className="flex-1 overflow-hidden relative bg-[#1e1e1e]">
                  <Textarea
                    id="template-html"
                    placeholder={`<html>\n<body>\n  <h1>Xin chào {contact.firstName}!</h1>\n  <p>Nội dung email...</p>\n</body>\n</html>`}
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    className="w-full h-full font-mono text-sm leading-relaxed border-0 rounded-none focus-visible:ring-0 resize-none p-4 bg-transparent text-slate-300 selection:bg-blue-500/30"
                    spellCheck={false}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-slate-900/80 backdrop-blur border-t border-white/10 flex justify-between items-center text-[10px] text-slate-400">
                    <span>{htmlContent.length} characters</span>
                    <span>Syntax check: OFF</span>
                  </div>
                </div>
              </Card>

              <Card className="flex flex-col h-full shadow-md overflow-hidden bg-slate-100">
                <CardHeader className="py-3 px-4 bg-slate-200 border-b">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-700">
                      <Eye className="h-4 w-4" />
                      Live Preview (Raw)
                    </span>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <div className="w-2 h-2 rounded-full bg-yellow-400" />
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                    </div>
                  </CardTitle>
                </CardHeader>
                <div className="flex-1 bg-white relative">
                  {!htmlContent.trim() ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 gap-2">
                      <Code2 className="h-12 w-12 opacity-20" />
                      <p className="text-sm">Nhập mã HTML để xem trước</p>
                    </div>
                  ) : (
                    <iframe
                      srcDoc={htmlContent}
                      title="Live Preview"
                      className="absolute inset-0 w-full h-full border-0"
                      sandbox="allow-same-origin"
                    />
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Variables Sidebar */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="sticky top-4">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  Cá nhân hóa
                </CardTitle>
                <CardDescription className="text-xs">
                  Copy biến để dán vào tiêu đề hoặc nội dung email.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 gap-2">
                  {TEMPLATE_VARIABLES.map((v) => (
                    <button
                      key={v.var}
                      type="button"
                      className="group w-full flex items-center justify-between p-2 rounded-lg bg-secondary/30 hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all text-left"
                      onClick={() => {
                        navigator.clipboard.writeText(v.var);
                        toast.success(`Đã copy: ${v.var}`);
                      }}
                    >
                      <div className="space-y-1">
                        <code className="text-xs text-primary font-bold font-mono group-hover:underline">
                          {v.var}
                        </code>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          {v.label}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6 p-3 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-700 leading-relaxed">
                  <p className="font-semibold mb-1">💡 Tips:</p>
                  Sử dụng biến trong <strong>Subject</strong> để tăng tỷ lệ mở email lên tới 20%.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/50 p-3 rounded-lg border border-dashed">
          <Info className="h-4 w-4 shrink-0 text-amber-500" />
          <p>
            Hệ thống sẽ tự động thêm link <strong>Unsubscribe</strong> và{" "}
            <strong>Tracking Pixel</strong> vào cuối email khi gửi chiến dịch thực tế. Đảm bảo cấu
            trúc HTML của bạn hợp lệ.
          </p>
        </div>

        {/* Preview Dialog */}
        <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
          <DialogContent className="max-w-5xl max-h-[95vh] flex flex-col p-0 gap-0 overflow-hidden">
            <DialogHeader className="p-4 border-b bg-slate-50">
              <div>
                <DialogTitle>Mô phỏng Email thực tế</DialogTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Sử dụng dữ liệu mẫu để kiểm tra các biến biến cá nhân hóa.
                </p>
              </div>
            </DialogHeader>
            <div className="p-4 bg-white border-b space-y-2">
              <div className="flex gap-2 items-center text-sm">
                <span className="font-semibold w-16 text-muted-foreground">Subject:</span>
                <span className="px-2 py-0.5 bg-slate-100 rounded border">{previewSubject}</span>
              </div>
              <div className="flex gap-2 items-center text-sm">
                <span className="font-semibold w-16 text-muted-foreground">From:</span>
                <span className="text-muted-foreground">
                  Vibe CMS &lt;newsletter@vibecms.com&gt;
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-slate-200 p-4 sm:p-8 flex justify-center">
              <div className="bg-white shadow-2xl w-full max-w-3xl min-h-[600px] rounded-sm overflow-hidden border">
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-full min-h-[600px] border-0"
                  title="Email API Preview"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Send Test Dialog */}
        <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Gửi Email test</DialogTitle>
              <DialogDescription>
                Nhập địa chỉ email để nhận bản thử nghiệm của template này.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="test-email-tpl">Email người nhận</Label>
                <Input
                  id="test-email-tpl"
                  type="email"
                  placeholder="name@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTestDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSendTest} disabled={sendTest.isPending}>
                {sendTest.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Gửi ngay
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
