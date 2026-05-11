import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmCampaigns, useDeleteEmCampaign } from "@/hooks/useEmailMarketing";
import { Plus, Send, Trash2, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

const STATUS_TABS = [
  { value: "", label: "Tất cả" },
  { value: "DRAFT", label: "Nháp" },
  { value: "SCHEDULED", label: "Đã lên lịch" },
  { value: "RUNNING", label: "Đang gửi" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
];

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

export default function EmCampaigns() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading } = useEmCampaigns({
    page,
    limit: 20,
    status: statusFilter || undefined,
  });

  const deleteCampaign = useDeleteEmCampaign();

  const campaigns = data?.items || [];
  const meta = data?.meta;

  const handleDelete = (id: number) => {
    deleteCampaign.mutate(id);
  };

  return (
    <AdminLayout title="Quản lý Campaigns">
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Campaigns
              </CardTitle>
              <CardDescription>
                Quản lý chiến dịch gửi email. Tổng: {meta?.total || 0} campaigns
              </CardDescription>
            </div>
            <Link to="/email-marketing/campaigns/new">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Tạo campaign
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {/* Status Tabs */}
            <Tabs
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
              className="mb-4"
            >
              <TabsList className="flex-wrap h-auto gap-1">
                {STATUS_TABS.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên campaign</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead className="hidden md:table-cell">Segments</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">Đã gửi</TableHead>
                    <TableHead className="text-right hidden lg:table-cell">Đã mở</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={7}>
                          <Skeleton className="h-8 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : campaigns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        <Send className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p>Chưa có campaign nào</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    campaigns.map((campaign: any) => (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <Link
                            to={`/email-marketing/campaigns/${campaign.id}`}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {campaign.name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {campaign.template?.name || "—"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {campaign.segments?.map((seg: any) => (
                              <Badge key={seg.id} variant="outline" className="text-xs">
                                {seg.name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={statusColors[campaign.status] || ""}
                            variant="secondary"
                          >
                            {statusLabels[campaign.status] || campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono hidden sm:table-cell">
                          {campaign.totalSent || 0}
                        </TableCell>
                        <TableCell className="text-right font-mono hidden lg:table-cell">
                          {campaign.totalOpened || 0}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Link to={`/email-marketing/campaigns/${campaign.id}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {(campaign.status === "DRAFT" || campaign.status === "CANCELLED") && (
                              <ConfirmDialog
                                trigger={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive/90"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                }
                                title="Xóa chiến dịch?"
                                description={`Bạn có chắc chắn muốn xóa chiến dịch "${campaign.name}"? Hành động này sẽ xóa vĩnh viễn các báo cáo liên quan.`}
                                onConfirm={() => handleDelete(campaign.id)}
                              />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage(Math.max(1, page - 1))}
                        className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {[...Array(Math.min(meta.totalPages, 5))].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            isActive={pageNum === page}
                            onClick={() => setPage(pageNum)}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage(Math.min(meta.totalPages, page + 1))}
                        className={
                          page >= meta.totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
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
    </AdminLayout>
  );
}
