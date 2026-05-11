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
import {
  useEmContacts,
  useEmSegments,
  useEmTemplates,
  useEmCampaigns,
} from "@/hooks/useEmailMarketing";
import { Users, Tags, FileText, Send, Mail, BarChart3, Plus, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function EmDashboard() {
  const { data: contactsData, isLoading: loadingContacts } = useEmContacts({ limit: 1 });
  const { data: segmentsData, isLoading: loadingSegments } = useEmSegments();
  const { data: templatesData, isLoading: loadingTemplates } = useEmTemplates({ limit: 1 });
  const { data: campaignsData, isLoading: loadingCampaigns } = useEmCampaigns({ limit: 5 });

  const totalContacts = contactsData?.meta?.total || 0;
  const totalSegments = segmentsData?.meta?.total || 0;
  const totalTemplates = templatesData?.meta?.total || 0;
  const totalCampaigns = campaignsData?.meta?.total || 0;

  const campaigns = campaignsData?.items || [];

  const statCards = [
    {
      title: "Contacts",
      value: totalContacts,
      icon: Users,
      href: "/email-marketing/contacts",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Segments",
      value: totalSegments,
      icon: Tags,
      href: "/email-marketing/segments",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950",
    },
    {
      title: "Templates",
      value: totalTemplates,
      icon: FileText,
      href: "/email-marketing/templates",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950",
    },
    {
      title: "Campaigns",
      value: totalCampaigns,
      icon: Send,
      href: "/email-marketing/campaigns",
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-950",
    },
  ];

  const isLoading = loadingContacts || loadingSegments || loadingTemplates || loadingCampaigns;

  return (
    <AdminLayout title="Email Marketing">
      <div className="space-y-6">
        {/* Header with quick actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Mail className="h-6 w-6 text-primary" />
              Email Marketing
            </h2>
            <p className="text-muted-foreground mt-1">
              Quản lý danh bạ, templates và chiến dịch email marketing
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/email-marketing/contacts">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Thêm contact
              </Button>
            </Link>
            <Link to="/email-marketing/campaigns/new">
              <Button size="sm">
                <Send className="h-4 w-4 mr-1" />
                Tạo campaign
              </Button>
            </Link>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <Link key={card.title} to={card.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                      {isLoading ? (
                        <Skeleton className="h-8 w-16 mt-1" />
                      ) : (
                        <p className="text-3xl font-bold tracking-tight mt-1">{card.value}</p>
                      )}
                    </div>
                    <div className={`p-3 rounded-xl ${card.bg}`}>
                      <card.icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Campaigns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Campaigns gần đây
              </CardTitle>
              <CardDescription>5 chiến dịch email gần nhất</CardDescription>
            </div>
            <Link to="/email-marketing/campaigns">
              <Button variant="ghost" size="sm">
                Xem tất cả
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loadingCampaigns ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Send className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Chưa có campaign nào</p>
                <Link to="/email-marketing/campaigns/new">
                  <Button variant="outline" size="sm" className="mt-3">
                    <Plus className="h-4 w-4 mr-1" />
                    Tạo campaign đầu tiên
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Đã gửi</TableHead>
                    <TableHead className="text-right">Đã mở</TableHead>
                    <TableHead className="text-right">Đã click</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign: any) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <Link
                          to={`/email-marketing/campaigns/${campaign.id}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {campaign.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[campaign.status] || ""} variant="secondary">
                          {statusLabels[campaign.status] || campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {campaign.totalSent || 0}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {campaign.totalOpened || 0}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {campaign.totalClicked || 0}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
