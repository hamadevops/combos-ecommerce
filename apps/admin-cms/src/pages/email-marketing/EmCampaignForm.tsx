import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmTemplates, useEmSegments, useCreateEmCampaign } from "@/hooks/useEmailMarketing";
import { ArrowLeft, Save, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

export default function EmCampaignForm() {
  const navigate = useNavigate();

  const { data: templatesData, isLoading: loadingTemplates } = useEmTemplates({ limit: 100 });
  const { data: segmentsData, isLoading: loadingSegments } = useEmSegments();
  const createCampaign = useCreateEmCampaign();

  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState<string>("");
  const [selectedSegments, setSelectedSegments] = useState<number[]>([]);
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");

  const templates = templatesData?.items || [];
  const segments = segmentsData?.items || [];

  const toggleSegment = (segId: number) => {
    setSelectedSegments((prev) =>
      prev.includes(segId) ? prev.filter((id) => id !== segId) : [...prev, segId],
    );
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Tên campaign là bắt buộc");
      return;
    }
    if (!templateId) {
      toast.error("Vui lòng chọn template");
      return;
    }
    if (selectedSegments.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 segment");
      return;
    }

    createCampaign.mutate(
      {
        name: name.trim(),
        templateId: Number(templateId),
        segmentIds: selectedSegments.map(String),
        fromName: fromName.trim() || undefined,
        fromEmail: fromEmail.trim() || undefined,
      },
      {
        onSuccess: () => navigate("/email-marketing/campaigns"),
      },
    );
  };

  const isLoading = loadingTemplates || loadingSegments;

  return (
    <AdminLayout title="Tạo Campaign">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/email-marketing/campaigns">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold">Tạo Campaign mới</h2>
            <p className="text-sm text-muted-foreground">
              Campaign sẽ được tạo với trạng thái Nháp (DRAFT)
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <>
            {/* Basic info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thông tin campaign</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign-name">Tên campaign *</Label>
                  <Input
                    id="campaign-name"
                    placeholder="VD: Khuyến mãi Tết 2025"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campaign-template">Template email *</Label>
                  <Select value={templateId} onValueChange={setTemplateId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((t: any) => (
                        <SelectItem key={t.id} value={String(t.id)}>
                          {t.name} — {t.subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Segments */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Chọn Segments *</CardTitle>
                <CardDescription>
                  Email sẽ được gửi đến tất cả contacts trong các segments đã chọn
                </CardDescription>
              </CardHeader>
              <CardContent>
                {segments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Chưa có segment nào.{" "}
                    <Link to="/email-marketing/segments" className="text-primary underline">
                      Tạo segment
                    </Link>
                  </p>
                ) : (
                  <div className="space-y-3">
                    {segments.map((seg: any) => (
                      <label
                        key={seg.id}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedSegments.includes(seg.id)}
                          onCheckedChange={() => toggleSegment(seg.id)}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{seg.name}</p>
                          {seg.description && (
                            <p className="text-xs text-muted-foreground">{seg.description}</p>
                          )}
                        </div>
                        <Badge
                          variant="secondary"
                          className="font-mono text-[10px] bg-blue-50 text-blue-700 border-blue-100"
                        >
                          {seg.contactCount ?? 0} recipients
                        </Badge>
                      </label>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Optional overrides */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tùy chỉnh người gửi</CardTitle>
                <CardDescription>Để trống sẽ dùng cấu hình SMTP mặc định</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="campaign-fromName">Tên người gửi</Label>
                    <Input
                      id="campaign-fromName"
                      placeholder="My Store"
                      value={fromName}
                      onChange={(e) => setFromName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="campaign-fromEmail">Email người gửi</Label>
                    <Input
                      id="campaign-fromEmail"
                      type="email"
                      placeholder="sale@mystore.com"
                      value={fromEmail}
                      onChange={(e) => setFromEmail(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <Link to="/email-marketing/campaigns" className="flex-1">
                <Button variant="outline" className="w-full">
                  Hủy
                </Button>
              </Link>
              <Button onClick={handleSubmit} disabled={createCampaign.isPending} className="flex-1">
                {createCampaign.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Tạo Campaign (Nháp)
              </Button>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
