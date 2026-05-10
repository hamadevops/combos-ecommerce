import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "@/lib/utils";
import {
  Search,
  Filter,
  Eye,
  MoreHorizontal,
  Package,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Loader2,
  LayoutGrid,
  List,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useOrders, useUpdateOrder } from "@/hooks/useOrders";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { OrderKanban } from "./OrderKanban";
import { OrderFilters, OrderActiveBadges } from "@/components/admin/orders/OrderFilters";
import { OrdersFindAllData } from "@vibe/shared";

// ─── Config ──────────────────────────────────────────────────────────────────

const orderStatusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
  CONFIRMED: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800 border-blue-200", icon: CheckCircle },
  PROCESSING: { label: "Đang xử lý", color: "bg-indigo-100 text-indigo-800 border-indigo-200", icon: Package },
  SHIPPING: { label: "Đang giao hàng", color: "bg-purple-100 text-purple-800 border-purple-200", icon: Truck },
  COMPLETED: { label: "Hoàn thành", color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
  CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
};

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Chưa thanh toán", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  PAID: { label: "Đã thanh toán", color: "bg-green-100 text-green-800 border-green-200" },
  FAILED: { label: "Thất bại", color: "bg-red-100 text-red-800 border-red-200" },
  REFUNDED: { label: "Đã hoàn tiền", color: "bg-gray-100 text-gray-700 border-gray-200" },
};

const getStatusCfg = (status?: string) => {
  const key = (status || "PENDING").toUpperCase();
  return orderStatusConfig[key] || orderStatusConfig["PENDING"];
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

// ─── Component ────────────────────────────────────────────────────────────────

type ViewMode = "table" | "kanban";

const AdminOrders = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem("admin_orders_view_mode") as ViewMode) || "table";
  });

  useEffect(() => {
    localStorage.setItem("admin_orders_view_mode", viewMode);
  }, [viewMode]);

  const [filterParams, setFilterParams] = useState<OrdersFindAllData["query"]>({});

  const { data: ordersData, isLoading, isFetching } = useOrders({ limit: 100, ...filterParams });
  const orders = Array.isArray(ordersData) ? ordersData : ordersData?.items || [];

  const { mutate: updateOrder } = useUpdateOrder();

  const filteredOrders = orders; // API does the filtering now

  if (isLoading) {
    return (
      <AdminLayout title="Quản lý đơn hàng">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Quản lý đơn hàng">
      {/* ── Header toolbar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold">Danh sách đơn hàng</h2>
          <p className="text-sm font-semibold text-muted-foreground">
            Theo dõi và xử lý đơn đặt hàng từ khách
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Smart Filters (Bitrix24 style) */}
          <div className="w-full md:w-[400px]">
            <OrderFilters value={filterParams} onFilterChange={setFilterParams} />
          </div>

          {/* View toggle */}
          <div className="flex items-center border rounded-lg overflow-hidden h-9">
            <button
              className={`px-2.5 h-full flex items-center gap-1.5 text-sm transition-colors ${viewMode === "table"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-muted-foreground"
                }`}
              onClick={() => setViewMode("table")}
              title="Dạng bảng"
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline text-xs font-medium">Bảng</span>
            </button>
            <button
              className={`px-2.5 h-full flex items-center gap-1.5 text-sm transition-colors ${viewMode === "kanban"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-muted-foreground"
                }`}
              onClick={() => setViewMode("kanban")}
              title="Dạng Kanban"
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline text-xs font-medium">Kanban</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <OrderActiveBadges filters={filterParams} onFilterChange={setFilterParams} />
      </div>

      {/* ── Kanban View ── */}
      {viewMode === "kanban" && (
        <OrderKanban orders={filteredOrders} />
      )}

      {/* ── Table View ── */}
      {viewMode === "table" && (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                  <TableRow>
                    <TableHead>Mã đơn</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead className="hidden md:table-cell">Địa chỉ</TableHead>
                    <TableHead>Ngày đặt</TableHead>
                    <TableHead className="text-center">SL</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="hidden lg:table-cell">Thanh toán</TableHead>
                    <TableHead className="text-right">Tổng tiền</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order: any) => {
                      const cfg = getStatusCfg(order.status);
                      const StatusIcon = cfg.icon;
                      const paymentCfg =
                        paymentStatusConfig[(order.paymentStatus || "PENDING").toUpperCase()] ||
                        paymentStatusConfig["PENDING"];

                      return (
                        <TableRow
                          key={order.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          <TableCell className="font-mono text-xs text-primary font-medium">
                            {order.code || `#${order.id}`}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{order.customerName || "N/A"}</span>
                              <span className="text-xs text-muted-foreground">
                                {order.customerPhone || "N/A"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell
                            className="hidden md:table-cell max-w-[180px] truncate text-sm text-muted-foreground"
                            title={order.shippingAddress}
                          >
                            {order.shippingAddress || "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                            {formatDate(order.createdAt)}
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            {order.items
                              ? order.items.reduce(
                                (acc: number, item: any) => acc + (item.quantity || 1),
                                0,
                              )
                              : 0}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`${cfg.color} whitespace-nowrap`}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {cfg.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Badge
                              variant="outline"
                              className={`${paymentCfg.color} whitespace-nowrap`}
                            >
                              {paymentCfg.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatPrice(order.finalAmount || order.totalAmount || 0)}
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => navigate(`/orders/${order.id}`)}
                                >
                                  <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateOrder({ id: order.id, data: { status: "CONFIRMED" } })
                                  }
                                >
                                  Xác nhận đơn
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateOrder({ id: order.id, data: { status: "PROCESSING" } })
                                  }
                                >
                                  Đang xử lý
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateOrder({ id: order.id, data: { status: "SHIPPING" } })
                                  }
                                >
                                  Đang giao hàng
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateOrder({ id: order.id, data: { status: "COMPLETED" } })
                                  }
                                >
                                  Hoàn thành
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() =>
                                    updateOrder({ id: order.id, data: { status: "CANCELLED" } })
                                  }
                                >
                                  Hủy đơn hàng
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="h-24 text-center text-muted-foreground"
                      >
                        Không tìm thấy đơn hàng nào.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
