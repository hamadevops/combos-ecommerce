import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEmConfig, useUpdateEmConfig, useSendTestConfig } from "@/hooks/useEmailMarketing";
import { Settings, Send, Shield, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ConfigItem {
  id?: number;
  key: string;
  value?: string;
  label: string;
  description: string;
}

const DEFAULT_FIELDS: ConfigItem[] = [
  { key: "smtp_host", label: "SMTP Host", description: "Địa chỉ máy chủ (vd: smtp.gmail.com)" },
  { key: "smtp_port", label: "SMTP Port", description: "Cổng SMTP (vd: 587, 465)" },
  { key: "smtp_secure", label: "SMTP Secure (SSL)", description: "Bật/tắt mã hóa SSL/TLS" },
  { key: "smtp_user", label: "SMTP Username", description: "Tài khoản đăng nhập SMTP" },
  { key: "smtp_pass", label: "SMTP Password", description: "Mật khẩu SMTP hoặc App Password" },
  {
    key: "from_name",
    label: "Tên người gửi",
    description: "Tên hiển thị khi người dùng nhận email",
  },
  { key: "from_email", label: "Email người gửi", description: "Địa chỉ email gửi đi mặc định" },
  { key: "reply_to", label: "Reply-To Email", description: "Email nhận thư trả lời từ khách hàng" },
  {
    key: "tracking_domain",
    label: "Tracking Domain",
    description: "Tên miền dùng để bắt tracking link (nếu có)",
  },
];

export default function EmSettings() {
  const { data: configs, isLoading } = useEmConfig();
  const updateConfig = useUpdateEmConfig();
  const sendTest = useSendTestConfig();

  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [testEmail, setTestEmail] = useState("");
  const [testDialogOpen, setTestDialogOpen] = useState(false);

  // Initialize form values from API data
  useEffect(() => {
    const values: Record<string, string> = {
      smtp_host: "",
      smtp_port: "587",
      smtp_secure: "false",
      smtp_user: "",
      smtp_pass: "",
      from_name: "Vibe CMS",
      from_email: "",
      reply_to: "",
      tracking_domain: "",
    };

    if (configs && Array.isArray(configs)) {
      configs.forEach((config: any) => {
        if (config.key) {
          values[config.key] = config.value || "";
        }
      });
    }
    setFormValues(values);
  }, [configs]);

  const handleChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const items = Object.entries(formValues).map(([key, value]) => ({
      key,
      value,
    }));
    updateConfig.mutate(items);
  };

  const handleSendTest = () => {
    if (!testEmail) return;
    sendTest.mutate(testEmail, {
      onSuccess: () => setTestDialogOpen(false),
    });
  };

  const getInputType = (key: string) => {
    if (key === "smtp_pass") return "password";
    if (key === "smtp_port") return "number";
    return "text";
  };

  const isSecureField = (key: string) => key === "smtp_secure";

  const configList = DEFAULT_FIELDS;

  return (
    <AdminLayout title="Cấu hình SMTP">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* SMTP Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Cấu hình máy chủ SMTP
            </CardTitle>
            <CardDescription>
              Thiết lập thông tin SMTP để gửi email marketing. Đảm bảo thông tin chính xác trước khi
              tạo campaign.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                {configList.map((config) => (
                  <div key={config.key} className="space-y-2">
                    <Label htmlFor={config.key} className="text-sm font-medium">
                      {config.label}
                    </Label>
                    {isSecureField(config.key) ? (
                      <div className="flex items-center gap-3">
                        <Switch
                          id={config.key}
                          checked={formValues[config.key] === "true"}
                          onCheckedChange={(checked) =>
                            handleChange(config.key, checked ? "true" : "false")
                          }
                        />
                        <span className="text-sm text-muted-foreground">
                          {formValues[config.key] === "true" ? "Bật SSL/TLS" : "Tắt SSL/TLS"}
                        </span>
                      </div>
                    ) : (
                      <Input
                        id={config.key}
                        type={getInputType(config.key)}
                        value={formValues[config.key] || ""}
                        onChange={(e) => handleChange(config.key, e.target.value)}
                        placeholder={config.description}
                      />
                    )}
                    {config.description && !isSecureField(config.key) && (
                      <p className="text-xs text-muted-foreground">{config.description}</p>
                    )}
                  </div>
                ))}

                <Separator />

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button onClick={handleSave} disabled={updateConfig.isPending} className="flex-1">
                    {updateConfig.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Shield className="h-4 w-4 mr-2" />
                    )}
                    Lưu cấu hình
                  </Button>

                  <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-1">
                        <Send className="h-4 w-4 mr-2" />
                        Gửi email thử
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Gửi email test</DialogTitle>
                        <DialogDescription>
                          Nhập email để kiểm tra cấu hình SMTP trước khi tạo campaign.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="test-email">Email nhận thử</Label>
                          <Input
                            id="test-email"
                            type="email"
                            placeholder="admin@example.com"
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setTestDialogOpen(false)}>
                          Hủy
                        </Button>
                        <Button
                          onClick={handleSendTest}
                          disabled={!testEmail || sendTest.isPending}
                        >
                          {sendTest.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4 mr-2" />
                          )}
                          Gửi thử
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Status Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3 text-sm">
              <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="space-y-1 text-muted-foreground">
                <p>
                  <strong>Gmail:</strong> Sử dụng "App Password" thay vì mật khẩu chính. Bật 2FA rồi
                  tạo App Password tại{" "}
                  <a
                    href="https://myaccount.google.com/apppasswords"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    myaccount.google.com/apppasswords
                  </a>
                </p>
                <p>
                  <strong>SMTP Port:</strong> 587 (STARTTLS) hoặc 465 (SSL/TLS)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
