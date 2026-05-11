import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useEmCampaign,
  useEmCampaignLogs,
  useScheduleEmCampaign,
  useCancelEmCampaign,
  useSendTestEmCampaign,
  useDeleteEmCampaign,
} from "@/hooks/useEmailMarketing";
import {
  ArrowLeft,
  Send,
  Calendar,
  XCircle,
  Trash2,
  Edit,
  BarChart3,
  Mail,
  CheckCircle2,
  AlertCircle,
  Eye,
  Loader2,
  Users,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  SCHEDULED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  RUNNING: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  PAUSED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Nháp",
  SCHEDULED: "Đã lên lịch",
  RUNNING: "Đang gửi",
  COMPLETED: "Hoàn thành",
  PAUSED: "Tạm dừng",
  CANCELLED: "Đã hủy",
};

const logStatusColors: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  SENT: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  FAILED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  OPENED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
};

interface EmCampaign {
  id: number;
  name: string;
  status: string;
  totalSent: number;
  totalFailed: number;
  totalOpened: number;
  totalClicked: number;
  totalContacts?: number;
  scheduledAt?: string;
  completedAt?: string;
  updatedAt?: string;
  fromName?: string;
  fromEmail?: string;
  template?: { id: number; name: string; htmlContent?: string; subject?: string };
  segments?: Array<{ id: number; name: string; contactCount?: number }>;
}

export default function EmCampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const campaignId = Number(id);

  const { data, isLoading } = useEmCampaign(campaignId);
  const campaign = data as EmCampaign | undefined;
  const [logPage, setLogPage] = useState(1);
  const [logStatusFilter, setLogStatusFilter] = useState("");
  const { data: logsData, isLoading: loadingLogs } = useEmCampaignLogs(campaignId, {
    page: logPage,
    limit: 50,
    status: logStatusFilter || undefined,
  });

  const scheduleCampaign = useScheduleEmCampaign(campaignId);
  const cancelCampaign = useCancelEmCampaign(campaignId);
  const sendTest = useSendTestEmCampaign(campaignId);
  const deleteCampaign = useDeleteEmCampaign();

  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [testEmail, setTestEmail] = useState("");

  const logs = (logsData as any)?.items || [];
  const meta = (logsData as any)?.meta;

  const status = campaign?.status || "";
  const totalContacts = campaign?.totalContacts || 0;
  const totalSent = campaign?.totalSent || 0;
  const totalFailed = campaign?.totalFailed || 0;
  const totalOpened = campaign?.totalOpened || 0;
  const totalClicked = campaign?.totalClicked || 0;

  const successRate =
    totalSent > 0 ? (((totalSent - totalFailed) / totalSent) * 100).toFixed(1) : "0";
  const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : "0";
  const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : "0";

  const handleSchedule = () => {
    if (!scheduledAt) {
      toast.error("Vui lòng chọn thời gian gửi");
      return;
    }
    scheduleCampaign.mutate(
      { scheduledAt: new Date(scheduledAt).toISOString() },
      {
        onSuccess: () => {
          setScheduleDialogOpen(false);
          toast.success("Đã lên lịch gửi campaign");
        },
      },
    );
  };

  const handleSendTest = () => {
    if (!testEmail) {
      toast.error("Vui lòng nhập email");
      return;
    }
    sendTest.mutate(testEmail, {
      onSuccess: () => {
        setTestDialogOpen(false);
        toast.success("Email test đang được gửi");
      },
    });
  };

  const handleCancel = () => {
    cancelCampaign.mutate();
  };

  const handleDelete = () => {
    deleteCampaign.mutate(campaignId, {
      onSuccess: () => navigate("/email-marketing/campaigns"),
    });
  };

  if (isLoading) {
    return (
      <AdminLayout title="Chi tiết Campaign">
        <div className="w-full space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Chi tiết Campaign">
      <div className="w-full space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center gap-4">
            <Link to="/email-marketing/campaigns">
              <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight">
                  {campaign?.name || "Campaign"}
                </h2>
                <Badge
                  className={`${statusColors[status]} px-2.5 py-0.5 rounded-full text-xs font-semibold`}
                  variant="secondary"
                >
                  {statusLabels[status] || status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  Template:{" "}
                  <span className="text-foreground font-medium ml-1">
                    {campaign?.template?.name || "N/A"}
                  </span>
                </div>
                {campaign?.scheduledAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Lịch gửi:{" "}
                    <span className="text-foreground font-medium ml-1">
                      {new Date(campaign.scheduledAt).toLocaleString("vi-VN")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {status === "DRAFT" && (
              <>
                <Button variant="outline" onClick={() => setTestDialogOpen(true)} className="h-9">
                  <Send className="h-4 w-4 mr-2" />
                  Gửi thử
                </Button>
                <Button
                  onClick={() => setScheduleDialogOpen(true)}
                  className="h-9 bg-primary hover:bg-primary/90"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Đặt lịch gửi
                </Button>
                <Link to={`/email-marketing/campaigns/${campaignId}/edit`}>
                  <Button variant="outline" className="h-9">
                    <Edit className="h-4 w-4 mr-2" />
                    Sửa
                  </Button>
                </Link>
              </>
            )}
            {(status === "SCHEDULED" || status === "RUNNING") && (
              <ConfirmDialog
                trigger={
                  <Button variant="destructive" className="h-9">
                    <XCircle className="h-4 w-4 mr-2" />
                    Hủy campaign
                  </Button>
                }
                title="Hủy chiến dịch?"
                description={`Bạn có chắc chắn muốn dừng gửi chiến dịch "${campaign?.name}"?`}
                onConfirm={handleCancel}
              />
            )}
            {(status === "CANCELLED" || status === "COMPLETED" || status === "DRAFT") && (
              <ConfirmDialog
                trigger={
                  <Button variant="ghost" className="h-9 text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa
                  </Button>
                }
                title="Xóa chiến dịch?"
                description={`Bạn có chắc chắn muốn xóa chiến dịch "${campaign?.name}" và toàn bộ báo cáo?`}
                onConfirm={handleDelete}
              />
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Tổng người nhận
                </p>
                <Users className="h-4 w-4 text-blue-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold">{totalContacts}</h3>
                <span className="text-xs text-muted-foreground">contacts</span>
              </div>
              <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: "100%" }} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Thành công / Lỗi
                </p>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold">{totalSent - totalFailed}</h3>
                <span className="text-sm text-red-500">/ {totalFailed}</span>
              </div>
              <div className="mt-3 flex justify-between items-center">
                <span className="text-xs font-medium text-muted-foreground">Success rate:</span>
                <span className="text-xs font-bold text-green-600">{successRate}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Đã mở (Open)
                </p>
                <Eye className="h-4 w-4 text-purple-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold">{totalOpened}</h3>
                <span className="text-xs text-muted-foreground">lượt mở</span>
              </div>
              <div className="mt-3 flex justify-between items-center">
                <span className="text-xs font-medium text-muted-foreground">Open rate:</span>
                <span className="text-xs font-bold text-purple-600">{openRate}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Tương tác (Click)
                </p>
                <BarChart3 className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold">{totalClicked}</span>
                <span className="text-xs text-muted-foreground">clicks</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <Badge
                  variant="outline"
                  className="text-[10px] h-4 px-1 text-primary border-primary/20 bg-primary/5"
                >
                  {totalSent ? Math.round((totalClicked / totalSent) * 100) : 0}% CTR
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Info */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base">Thông tin chiến dịch</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                      Tên chiến dịch
                    </Label>
                    <p className="font-semibold text-lg">{campaign?.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                      Phân khúc khách hàng mục tiêu
                    </Label>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {campaign?.segments?.map((s) => (
                        <Badge
                          key={s.id}
                          variant="secondary"
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700"
                        >
                          {s.name} ({s.contactCount || 0})
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                        Trạng thái
                      </Label>
                      <div className="mt-1">
                        {status === "DRAFT" && (
                          <Badge variant="outline" className="bg-slate-50">
                            Nháp
                          </Badge>
                        )}
                        {status === "SCHEDULED" && (
                          <Badge className="bg-blue-500">Đã đặt lịch</Badge>
                        )}
                        {status === "RUNNING" && (
                          <Badge className="bg-amber-500 animate-pulse">Đang gửi...</Badge>
                        )}
                        {status === "COMPLETED" && (
                          <Badge className="bg-green-600">Hoàn thành</Badge>
                        )}
                        {status === "CANCELLED" && <Badge variant="destructive">Đã hủy</Badge>}
                        {status === "PAUSED" && <Badge variant="secondary">Tạm dừng</Badge>}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                        Ngày tạo
                      </Label>
                      <p className="text-sm font-medium mt-1">
                        {campaign?.updatedAt
                          ? new Date(campaign.updatedAt).toLocaleDateString("vi-VN")
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                      Nội dung Template
                    </Label>
                    <div className="flex items-center gap-2 mt-1">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        {campaign?.template?.name || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm overflow-hidden">
              <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Báo cáo chi tiết gửi tin
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-normal">
                  {meta?.total || 0} người nhận
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="w-[250px] font-semibold">Khách hàng</TableHead>
                      <TableHead className="font-semibold">Trạng thái</TableHead>
                      <TableHead className="font-semibold">Lần đầu mở</TableHead>
                      <TableHead className="text-right font-semibold">Mở</TableHead>
                      <TableHead className="text-right font-semibold text-primary">
                        Clicks
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                          {loadingLogs ? "Đang tải báo cáo..." : "Chưa có dữ liệu gửi tin"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      logs.map((log: any) => (
                        <TableRow key={log.id} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell>
                            <div className="font-medium text-slate-900">{log.contactEmail}</div>
                            <div className="text-[10px] text-muted-foreground">ID: {log.id}</div>
                          </TableCell>
                          <TableCell>
                            {log.status === "SENT" && (
                              <Badge
                                variant="secondary"
                                className="bg-blue-50 text-blue-700 border-blue-100"
                              >
                                Đã gửi
                              </Badge>
                            )}
                            {log.status === "OPENED" && (
                              <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                                Đã mở
                              </Badge>
                            )}
                            {log.status === "FAILED" && (
                              <Badge
                                variant="destructive"
                                className="bg-red-50 text-red-700 border-red-100"
                              >
                                Lỗi
                              </Badge>
                            )}
                            {log.status === "PENDING" && (
                              <Badge variant="outline" className="text-slate-400">
                                Chờ...
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {log.openedAt ? new Date(log.openedAt).toLocaleString("vi-VN") : "—"}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {log.openCount || 0}
                          </TableCell>
                          <TableCell className="text-right font-bold text-primary">
                            {log.clickCount || 0}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                {meta && meta.totalPages > 1 && (
                  <div className="p-4 border-t bg-slate-50/30">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setLogPage(Math.max(1, logPage - 1))}
                            className={
                              logPage <= 1
                                ? "pointer-events-none opacity-50 text-[10px]"
                                : "cursor-pointer text-[10px]"
                            }
                          />
                        </PaginationItem>
                        <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
                          Trang {logPage} / {meta.totalPages}
                        </div>
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setLogPage(Math.min(meta.totalPages, logPage + 1))}
                            className={
                              logPage >= meta.totalPages
                                ? "pointer-events-none opacity-50 text-[10px]"
                                : "cursor-pointer text-[10px]"
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Area - Template Preview Stickied */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="sticky top-4 shadow-sm border-slate-200 overflow-hidden">
              <CardHeader className="py-3 px-4 bg-slate-100 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Eye className="h-3.5 w-3.5" />
                  Preview Template
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => navigate(`/email-marketing/templates/${campaign?.template?.id}`)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              </CardHeader>
              <div className="bg-slate-50 relative aspect-[3/4] overflow-hidden group">
                {/* Container for the iframe representing the email content proportionally shrunk */}
                <div className="absolute inset-2 bg-white shadow-lg border rounded-sm overflow-hidden border-slate-200">
                  <div className="p-2 border-b bg-slate-50 text-[10px] space-y-1">
                    <div className="flex gap-1.5">
                      <span className="text-muted-foreground w-12 shrink-0">Subject:</span>
                      <span className="font-medium truncate">
                        {campaign?.template?.subject || "Subject..."}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      <span className="text-muted-foreground w-12 shrink-0">From:</span>
                      <span className="font-medium truncate">
                        {campaign?.fromName || "Vibe Marketing"}
                      </span>
                    </div>
                  </div>
                  {/* The actually rendered email HTML */}
                  <div className="relative w-full h-full bg-white">
                    {campaign?.template?.htmlContent ? (
                      <iframe
                        srcDoc={campaign.template.htmlContent}
                        className="w-full h-full border-0 pointer-events-none"
                        title="Template Preview"
                        sandbox="allow-same-origin"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-300">
                        <p className="text-sm">Chưa có nội dung</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="absolute inset-0 bg-slate-900/0 hover:bg-slate-900/40 transition-all flex items-center justify-center group">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity scale-90 hover:scale-100"
                    onClick={() => {
                      // Open larger preview if needed, or navigate to template
                      navigate(`/email-marketing/templates/${campaign?.template?.id}`);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Chi tiết
                  </Button>
                </div>
              </div>
              <div className="p-4 border-t bg-slate-50">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Lượt mở tổng:</span>
                  <span className="font-bold text-green-600">{campaign?.totalOpened || 0}</span>
                </div>
                <div className="flex justify-between items-center text-xs mt-2">
                  <span className="text-muted-foreground">Lượt click tổng:</span>
                  <span className="font-bold text-primary">{campaign?.totalClicked || 0}</span>
                </div>
              </div>
            </Card>

            <Card className="border-red-100 bg-red-50/20 shadow-sm">
              <CardHeader className="py-4 border-b border-red-100">
                <CardTitle className="text-sm text-red-600 font-bold">Vùng nguy hiểm</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ConfirmDialog
                  trigger={
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full h-9 bg-red-600 hover:bg-red-700"
                      disabled={deleteCampaign.isPending}
                    >
                      {deleteCampaign.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Hủy & Xóa vĩnh viễn
                    </Button>
                  }
                  title="Xóa vĩnh viễn?"
                  description="Thao tác này sẽ xóa toàn bộ dữ liệu chiến dịch, templates và các báo cáo liên quan. Bạn không thể khôi phục sau khi xóa."
                  onConfirm={handleDelete}
                />
                <p className="text-[10px] text-red-500 mt-2 text-center">
                  Hành động này không thể hoàn tác.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Schedule Dialog */}
        <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Đặt lịch gửi Campaign</DialogTitle>
              <DialogDescription>
                Chọn thời điểm hệ thống sẽ tự động bắt đầu gửi email cho các contacts trong segment.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="schedule-time" className="font-bold">
                  Thời gian bắt đầu gửi
                </Label>
                <Input
                  id="schedule-time"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="bg-slate-50"
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="text-[10px] text-muted-foreground italic mt-1">
                  * Lưu ý: Campaign sẽ được đưa vào hàng đợi BullMQ vào đúng thời điểm này.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
                Đóng
              </Button>
              <Button onClick={handleSchedule} disabled={scheduleCampaign.isPending}>
                {scheduleCampaign.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Xác nhận đặt lịch
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Send Test Dialog */}
        <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Gửi Email kiểm tra</DialogTitle>
              <DialogDescription>
                Hệ thống sẽ gửi 1 email duy nhất tới địa chỉ này để bạn kiểm tra định dạng và hiển
                thị thực tế.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="test-email" className="font-bold">
                  Email người nhận thử
                </Label>
                <Input
                  id="test-email"
                  type="email"
                  placeholder="admin@yourdomain.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="bg-slate-50"
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
