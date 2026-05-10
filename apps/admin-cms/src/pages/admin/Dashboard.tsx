import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  DollarSign,
  ShoppingCart,
  Eye,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  CalendarIcon,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { PermissionEnum } from "@/constants/permissions";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { formatPrice } from "@/utils/format";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDashboard } from "@/hooks/useDashboard";
import type {
  OverviewCardDto,
  RevenueByMonthItemDto,
  OrdersByDayItemDto,
  CategoryDistributionItemDto,
  TopSellingProductItemDto,
} from "@vibe/shared";

const COLORS = [
  "hsl(199 89% 48%)", // Blue
  "hsl(346 77% 50%)", // Pink/Red
  "hsl(142 76% 36%)", // Green
  "hsl(38 92% 50%)",  // Orange
  "hsl(280 67% 50%)", // Purple
  "hsl(217 91% 60%)", // Light Blue
  "hsl(12 87% 56%)",  // Coral
  "hsl(162 63% 41%)", // Mint
];

/* ---------- Stat Card Config ---------- */
const statCardConfig = [
  { key: "revenue" as const, title: "Doanh thu", icon: DollarSign, formatValue: (v: number) => formatPrice(v) },
  { key: "newOrders" as const, title: "Đơn hàng mới", icon: ShoppingCart, formatValue: (v: number) => v.toLocaleString("vi-VN") },
  { key: "visits" as const, title: "Lượt truy cập", icon: Eye, formatValue: (v: number) => v.toLocaleString("vi-VN") },
  { key: "newCustomers" as const, title: "Khách hàng mới", icon: Users, formatValue: (v: number) => v.toLocaleString("vi-VN") },
];

/* ---------- Skeleton Components ---------- */
const StatCardSkeleton = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      <div className="h-4 w-4 animate-pulse rounded bg-muted" />
    </CardHeader>
    <CardContent>
      <div className="h-7 w-32 animate-pulse rounded bg-muted" />
      <div className="mt-2 h-4 w-40 animate-pulse rounded bg-muted" />
    </CardContent>
  </Card>
);

const ChartSkeleton = ({ height = 300 }: { height?: number }) => (
  <div className="flex items-center justify-center" style={{ height }}>
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
);

/* ---------- Helper: format month label ---------- */
const formatMonthLabel = (month: string) => {
  // "2026-01" → "Tháng 1"
  const m = parseInt(month.split("-")[1], 10);
  return `Tháng ${m}`;
};

/* ---------- Helper: format day label ---------- */
const formatDayLabel = (date: string) => {
  // "2026-04-01" → "01/04"
  const parts = date.split("-");
  return `${parts[2]}/${parts[1]}`;
};

/* ---------- Helper: local date formatter ---------- */
const formatLocalDate = (d: Date) => {
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().split("T")[0];
};

/* ---------- Date Ranges Helper ---------- */
const getTodayRange = (): { start: string; end: string } => {
  const now = new Date();
  const dateStr = formatLocalDate(now);
  return { start: dateStr, end: dateStr };
};

const getThisWeekRange = (): { start: string; end: string } => {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: formatLocalDate(monday), end: formatLocalDate(sunday) };
};

const getThisMonthRange = (): { start: string; end: string } => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start: formatLocalDate(start), end: formatLocalDate(end) };
};

const getThisYearRange = (): { start: string; end: string } => {
  const now = new Date();
  return {
    start: formatLocalDate(new Date(now.getFullYear(), 0, 1)),
    end: formatLocalDate(new Date(now.getFullYear(), 11, 31)),
  };
};

/* ---------- Main Component ---------- */
const Dashboard = () => {
  const [startDate, setStartDate] = useState<string>(getTodayRange().start);
  const [endDate, setEndDate] = useState<string>(getTodayRange().end);
  const [activePreset, setActivePreset] = useState<string>("today");

  const { data: rawData, isLoading, isFetching, isError, refetch } = useDashboard({ startDate, endDate });

  // API returns { traceId, success, data: DashboardStatsResponseDto }
  // request() helper returns the full wrapper, so unwrap .data
  const stats = (rawData as any)?.data ?? rawData;

  /* Map API data for charts */
  const revenueChartData = stats?.revenueByMonth?.map((item: RevenueByMonthItemDto) => ({
    name: formatMonthLabel(item.month),
    revenue: item.revenue,
  })) ?? [];

  const ordersChartData = stats?.ordersByDay?.map((item: OrdersByDayItemDto) => ({
    name: formatDayLabel(item.date),
    orders: item.count,
  })) ?? [];

  const categoryChartData = stats?.categoryDistribution?.map((item: CategoryDistributionItemDto) => ({
    name: item.name,
    value: item.count,
  })) ?? [];

  const topProducts: TopSellingProductItemDto[] = stats?.topSellingProducts ?? [];

  const applyPreset = (preset: string) => {
    setActivePreset(preset);
    let range: { start: string; end: string };
    switch (preset) {
      case "today":
        range = getTodayRange();
        break;
      case "week":
        range = getThisWeekRange();
        break;
      case "month":
        range = getThisMonthRange();
        break;
      case "year":
        range = getThisYearRange();
        break;
      default:
        return;
    }
    setStartDate(range.start);
    setEndDate(range.end);
  };

  return (
    <AdminLayout title="Dashboard">
      <PermissionGuard permissions={[PermissionEnum.DASHBOARD_VIEW]}>
        {/* Date Filter Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-wrap items-center gap-3"
      >
        {/* Preset buttons */}
        <div className="flex items-center gap-1">
          {[
            { key: "today", label: "Hôm nay" },
            { key: "week", label: "Tuần này" },
            { key: "month", label: "Tháng này" },
            { key: "year", label: "Năm nay" },
          ].map((p) => (
            <Button
              key={p.key}
              variant={activePreset === p.key ? "default" : "outline"}
              size="sm"
              onClick={() => applyPreset(p.key)}
            >
              {p.label}
            </Button>
          ))}
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[140px] justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(new Date(startDate), "dd/MM/yyyy") : <span>Bắt đầu</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                locale={vi}
                selected={startDate ? new Date(startDate) : undefined}
                onSelect={(date) => {
                  if (date) {
                    setStartDate(formatLocalDate(date));
                    setActivePreset("");
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <span className="text-muted-foreground">→</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[140px] justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(new Date(endDate), "dd/MM/yyyy") : <span>Kết thúc</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                locale={vi}
                selected={endDate ? new Date(endDate) : undefined}
                onSelect={(date) => {
                  if (date) {
                    setEndDate(formatLocalDate(date));
                    setActivePreset("");
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading || isFetching}>
          <RefreshCw className={cn("mr-1 h-4 w-4", (isLoading || isFetching) && "animate-spin")} />
          Làm mới
        </Button>
      </motion.div>

      {/* Error State */}
      {isError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/5 p-4"
        >
          <AlertCircle className="h-5 w-5 text-destructive" />
          <span className="text-sm text-destructive">Không thể tải dữ liệu dashboard.</span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Thử lại
          </Button>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              >
                <StatCardSkeleton />
              </motion.div>
            ))
          : statCardConfig.map((cfg, index) => {
              const cardData: OverviewCardDto | undefined = stats?.[cfg.key];
              return (
                <motion.div
                  key={cfg.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {cfg.title}
                      </CardTitle>
                      <cfg.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {cardData ? cfg.formatValue(cardData.value) : "—"}
                      </div>
                      {cardData && (
                        <div className="mt-1 flex items-center text-sm">
                          {cardData.trend === "up" ? (
                            <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowDownRight className="mr-1 h-4 w-4 text-destructive" />
                          )}
                          <span
                            className={cn(
                              cardData.trend === "up" ? "text-green-500" : "text-destructive",
                            )}
                          >
                            {cardData.percentChange > 0 ? "+" : ""}
                            {cardData.percentChange.toFixed(1)}%
                          </span>
                          <span className="ml-1 text-muted-foreground">so với kỳ trước</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
      </div>

      {/* Charts Row 1 */}
      <div className="mt-6 grid gap-6 lg:grid-cols-1">
        {/* Orders by Day Chart (Spans 1 full width) */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
         >
          <Card>
            <CardHeader>
              <CardTitle>Đơn hàng theo ngày</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {isLoading ? (
                  <ChartSkeleton />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ordersChartData}>
                      <defs>
                        <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Area type="monotone" dataKey="orders" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorOrders)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Left Column: Revenue & Category */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Doanh thu theo tháng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  {isLoading ? (
                    <ChartSkeleton height={250} />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis
                          className="text-xs"
                          tickFormatter={(value) => `${value / 1000000}M`}
                        />
                        <Tooltip
                          formatter={(value: number) => formatPrice(value)}
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Phân bổ danh mục</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] flex items-center">
                  {isLoading ? (
                    <ChartSkeleton height={250} />
                  ) : (
                    <>
                      <ResponsiveContainer width="55%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {categoryChartData.map((_: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      {!isLoading && categoryChartData.length > 0 && (
                        <div className="w-[45%] flex flex-col justify-center gap-2">
                          {categoryChartData.map((item: any, index: number) => (
                            <div key={item.name} className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="text-xs text-muted-foreground truncate" title={`${item.name} (${item.value})`}>
                                {item.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Top Products */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.7 }}
           className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Sản phẩm bán chạy</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
                        <div className="space-y-1">
                          <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                        </div>
                      </div>
                      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    </div>
                  ))}
                </div>
              ) : topProducts.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Chưa có dữ liệu sản phẩm bán chạy.
                </p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px] text-center">#</TableHead>
                        <TableHead>Sản phẩm</TableHead>
                        <TableHead className="text-right w-[100px]">Đã bán</TableHead>
                        <TableHead className="text-right w-[150px]">Doanh thu</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topProducts.map((product, index) => (
                        <TableRow key={product.id}>
                          <TableCell className="text-center font-medium">
                            {index + 1}
                          </TableCell>
                          <TableCell className="font-medium max-w-[200px] truncate" title={product.name}>
                            {product.name}
                          </TableCell>
                          <TableCell className="text-right">{product.soldCount}</TableCell>
                          <TableCell className="text-right font-medium text-primary">
                            {formatPrice(product.revenue)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
      </PermissionGuard>
    </AdminLayout>
  );
};

export default Dashboard;
