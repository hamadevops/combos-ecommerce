import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getImageUrl, formatPrice } from "@/lib/utils";
import {
  ArrowLeft,
  X,
  Package,
  CreditCard,
  MapPin,
  User,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Printer,
  Loader2,
  ChevronDown,
  TrendingUp,
  Save,
  AlertTriangle,
  Activity,
  UserCheck,
  Edit3,
  DollarSign,
  ShoppingBag,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useOrderDetail, useUpdateOrder } from "@/hooks/useOrders";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { UpdateOrderDto } from "@projects/shared";

// ─── Status configs ───────────────────────────────────────────────────────────

const orderStatusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800 border-yellow-300", icon: Clock },
  CONFIRMED: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800 border-blue-300", icon: CheckCircle },
  PROCESSING: { label: "Đang xử lý", color: "bg-indigo-100 text-indigo-800 border-indigo-300", icon: Package },
  SHIPPING: { label: "Đang giao hàng", color: "bg-purple-100 text-purple-800 border-purple-300", icon: Truck },
  COMPLETED: { label: "Hoàn thành", color: "bg-green-100 text-green-800 border-green-300", icon: CheckCircle },
  CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-800 border-red-300", icon: XCircle },
};

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Chưa thanh toán", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  PAID: { label: "Đã thanh toán", color: "bg-green-100 text-green-800 border-green-300" },
  FAILED: { label: "Thất bại", color: "bg-red-100 text-red-800 border-red-300" },
  REFUNDED: { label: "Đã hoàn tiền", color: "bg-gray-100 text-gray-700 border-gray-300" },
};

const paymentMethodLabel: Record<string, string> = {
  COD: "Thanh toán khi nhận hàng (COD)",
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
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

// ─── Fake Activity Log ────────────────────────────────────────────────────────

type ActivityEvent = {
  id: number;
  type: "created" | "status" | "payment" | "address" | "customer" | "note" | "system";
  actor: string;
  actorRole: "admin" | "system" | "customer";
  action: string;
  detail?: string;
  timestamp: string;
};

const generateFakeLog = (orderCode: string): ActivityEvent[] => {
  const now = new Date();
  const ago = (minutes: number) =>
    new Date(now.getTime() - minutes * 60 * 1000).toISOString();
  return [
    { id: 1, type: "created", actor: "Hệ thống", actorRole: "system", action: "Đơn hàng được tạo", detail: `Mã đơn: ${orderCode}`, timestamp: ago(240) },
    { id: 2, type: "status", actor: "Admin", actorRole: "admin", action: "Đã xác nhận đơn hàng", detail: "Trạng thái: Chờ xác nhận → Đã xác nhận", timestamp: ago(200) },
    { id: 3, type: "payment", actor: "Hệ thống", actorRole: "system", action: "Ghi nhận thanh toán thành công", detail: "Phương thức: Chuyển khoản ngân hàng", timestamp: ago(195) },
    { id: 4, type: "customer", actor: "Admin", actorRole: "admin", action: "Cập nhật thông tin khách hàng", detail: "Sửa số điện thoại liên hệ", timestamp: ago(150) },
    { id: 5, type: "address", actor: "Admin", actorRole: "admin", action: "Cập nhật địa chỉ giao hàng", detail: "Địa chỉ mới: 123 Đường ABC, Phường Bến Nghé, Quận 1, TP.HCM", timestamp: ago(90) },
    { id: 6, type: "status", actor: "Admin", actorRole: "admin", action: "Chuyển trạng thái đơn hàng", detail: "Đã xác nhận → Đang xử lý", timestamp: ago(60) },
    { id: 7, type: "status", actor: "Admin", actorRole: "admin", action: "Chuyển sang giao hàng", detail: "Đang xử lý → Đang giao hàng · Mã vận đơn: GHN-12345678", timestamp: ago(15) },
    { id: 8, type: "note", actor: "Admin", actorRole: "admin", action: "Thêm ghi chú nội bộ", detail: "Khách yêu cầu giao trước 17h, gọi trước khi đến.", timestamp: ago(5) },
  ];
};

const activityIconMap: Record<ActivityEvent["type"], { icon: any; color: string; bg: string }> = {
  created: { icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  status: { icon: RefreshCw, color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
  payment: { icon: DollarSign, color: "text-green-600", bg: "bg-green-50 border-green-200" },
  address: { icon: MapPin, color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
  customer: { icon: UserCheck, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200" },
  note: { icon: MessageSquare, color: "text-gray-600", bg: "bg-gray-50 border-gray-200" },
  system: { icon: Activity, color: "text-cyan-600", bg: "bg-cyan-50 border-cyan-200" },
};

// ─── Info Row — consistent label/value display ─────────────────────────────────

const InfoRow = ({ label, value, className = "" }: { label: string; value?: React.ReactNode; className?: string }) => (
  <div className={className}>
    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
    <p className="text-sm font-medium text-foreground leading-snug">{value || <span className="text-muted-foreground">—</span>}</p>
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const orderId = Number(id);

  const { data: orderData, isLoading, isError } = useOrderDetail(orderId);
  const order = (orderData as any)?.data || orderData;

  const { mutate: updateOrder } = useUpdateOrder();

  const [activeTab, setActiveTab] = useState("detail");
  const [isUtmOpen, setIsUtmOpen] = useState(false);
  const [form, setForm] = useState<UpdateOrderDto>({});
  const [isSaving, setIsSaving] = useState(false);
  const [fakeLog, setFakeLog] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    if (order) {
      setForm({
        status: (order.status || "PENDING").toUpperCase(),
        paymentStatus: (order.paymentStatus || "PENDING").toUpperCase(),
        customerName: order.customerName || "",
        customerPhone: order.customerPhone || "",
        customerEmail: order.customerEmail || "",
        shippingAddress: order.shippingAddress || "",
        shippingCity: order.shippingCity || "",
        shippingDistrict: order.shippingDistrict || "",
        shippingWard: order.shippingWard || "",
        notes: order.notes || "",
      });
      setFakeLog(generateFakeLog(order.code || `#${order.id}`));
    }
  }, [order]);

  const updateForm = (key: keyof UpdateOrderDto, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value || undefined }));

  const handleSave = () => {
    if (!order) return;
    setIsSaving(true);
    updateOrder(
      { id: order.id, data: { ...form } },
      {
        onSuccess: () => {
          const newEntry: ActivityEvent = {
            id: Date.now(), type: "status", actor: "Admin", actorRole: "admin",
            action: "Cập nhật đơn hàng",
            detail: `Trạng thái mới: ${getStatusCfg(form.status).label}`,
            timestamp: new Date().toISOString(),
          };
          setFakeLog((prev) => [newEntry, ...prev]);
          setActiveTab("detail");
        },
        onSettled: () => setIsSaving(false),
      },
    );
  };

  // ─── Loading / Error ─────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <AdminLayout title="Chi tiết đơn hàng">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (isError || !order) {
    return (
      <AdminLayout title="Chi tiết đơn hàng">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">Không tìm thấy đơn hàng.</p>
          <Button variant="outline" onClick={() => navigate("/orders")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay về danh sách
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const statusCfg = getStatusCfg(form.status || order.status);
  const StatusIcon = statusCfg.icon;
  const paymentCfg = paymentStatusConfig[(form.paymentStatus || order.paymentStatus || "PENDING").toUpperCase()]
    || paymentStatusConfig["PENDING"];

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <AdminLayout title={`Đơn hàng ${order.code || `#${order.id}`}`}>
      <div className="max-w-[1400px] mx-auto space-y-4">

        {/* ── Sticky Page Header ── */}
        <div className="flex items-center gap-3 bg-background/95 backdrop-blur py-2 flex-wrap">
          {/* Back */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/orders")}
            className="gap-1.5 text-muted-foreground hover:text-foreground shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>

          <div className="w-px h-5 bg-border hidden sm:block" />

          {/* Order code + badges */}
          <div className="flex items-center gap-2.5 flex-1 flex-wrap">
            <span className="font-mono font-bold text-base tracking-tight">
              {order.code || `#${order.id}`}
            </span>
            <Badge variant="outline" className={`${statusCfg.color} gap-1 font-medium`}>
              <StatusIcon className="h-3 w-3" />
              {statusCfg.label}
            </Badge>
            <Badge variant="outline" className={`${paymentCfg.color} font-medium`}>
              {paymentCfg.label}
            </Badge>
          </div>

          {/* Created time */}
          <span className="text-sm text-muted-foreground shrink-0 flex items-center gap-1">
            <Clock className="inline h-3.5 w-3.5" />
            {formatDate(order.createdAt)}
          </span>

          {/* Action buttons — in header */}
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Printer className="h-4 w-4" />
              In hóa đơn
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => setActiveTab(activeTab === "update" ? "detail" : "update")}
            >
              <Edit3 className="h-4 w-4" />
              Cập nhật đơn
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/orders")}
              title="Đóng"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* ── 2-Column Body ── */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 items-start">

          {/* LEFT: 3/5 */}
          <div className="xl:col-span-3">
            <Card className="overflow-hidden shadow-sm">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="border-b px-5 py-2">
                  <TabsList className="h-9 gap-1">
                    <TabsTrigger value="detail" className="text-sm px-5">Chi tiết</TabsTrigger>
                    <TabsTrigger value="update" className="text-sm px-5">Cập nhật</TabsTrigger>
                  </TabsList>
                </div>

                {/* ── Tab: Chi tiết ── */}
                <TabsContent value="detail" className="m-0">
                  <ScrollArea className="h-[calc(100vh-210px)]">
                    <div className="p-6 space-y-7">

                      {/* Customer */}
                      <section className="space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <h3 className="font-semibold text-sm">Thông tin khách hàng</h3>
                        </div>
                        <div className="bg-muted/30 border rounded-xl p-4 grid grid-cols-2 gap-4">
                          <InfoRow label="Họ tên" value={order.customerName} />
                          <InfoRow label="Điện thoại" value={order.customerPhone} />
                          <InfoRow label="Email" className="col-span-2" value={order.customerEmail} />
                        </div>
                      </section>

                      {/* Shipping */}
                      <section className="space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <h3 className="font-semibold text-sm">Địa chỉ giao hàng</h3>
                        </div>
                        <div className="bg-muted/30 border rounded-xl p-4 space-y-3">
                          <InfoRow label="Địa chỉ chi tiết" value={order.shippingAddress} />
                          {(order.shippingWard || order.shippingDistrict || order.shippingCity) && (
                            <InfoRow
                              label="Khu vực"
                              value={[order.shippingWard, order.shippingDistrict, order.shippingCity].filter(Boolean).join(", ")}
                            />
                          )}
                          {order.notes && (
                            <>
                              <Separator className="my-1" />
                              <InfoRow label="Ghi chú" value={<span className="italic">{order.notes}</span>} />
                            </>
                          )}
                        </div>
                      </section>

                      {/* Items */}
                      <section className="space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                            <Package className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <h3 className="font-semibold text-sm">Sản phẩm ({order.items?.length || 0})</h3>
                        </div>
                        <div className="border rounded-xl divide-y overflow-hidden">
                          {(order.items || []).map((item: any) => (
                            <div key={item.id} className="p-4 flex gap-4">
                              <div className="h-16 w-16 bg-muted rounded-lg overflow-hidden shrink-0">
                                <img
                                  src={getImageUrl(
                                    item.productImage || item.thumbnail ||
                                    (typeof item.product === "object" ? item.product?.thumbnail : null),
                                  )}
                                  alt={item.productName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/100?text=No+Image"; }}
                                />
                              </div>
                              <div className="flex-1 min-w-0 space-y-1">
                                <p className="font-semibold text-sm leading-tight">{item.productName}</p>
                                {item.variantName && (
                                  <p className="text-xs text-muted-foreground">{item.variantName}</p>
                                )}
                                {item.sku && (
                                  <p className="text-xs text-muted-foreground font-mono">SKU: {item.sku}</p>
                                )}
                                <div className="flex items-center justify-between pt-1">
                                  <span className="text-sm text-muted-foreground">
                                    x{item.quantity} × {formatPrice(item.price)}
                                  </span>
                                  <span className="font-bold text-sm">
                                    {formatPrice(item.total || item.price * item.quantity)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* Payment */}
                      <section className="space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                            <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <h3 className="font-semibold text-sm">Thanh toán</h3>
                        </div>
                        <div className="bg-muted/30 border rounded-xl p-4 space-y-3 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground font-medium">Phương thức</span>
                            <span className="font-semibold">
                              {paymentMethodLabel[order.paymentMethod] || order.paymentMethod}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground font-medium">Trạng thái TT</span>
                            <Badge variant="outline" className={`${paymentCfg.color} font-medium`}>
                              {paymentCfg.label}
                            </Badge>
                          </div>
                          <Separator />
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Tạm tính</span>
                            <span className="font-medium">{formatPrice(order.totalAmount || 0)}</span>
                          </div>
                          {order.shippingFee > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Phí vận chuyển</span>
                              <span className="font-medium">{formatPrice(order.shippingFee)}</span>
                            </div>
                          )}
                          {order.discountAmount > 0 && (
                            <div className="flex justify-between items-center text-green-600">
                              <span>Giảm giá</span>
                              <span className="font-medium">−{formatPrice(order.discountAmount)}</span>
                            </div>
                          )}
                          <Separator />
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-base">Tổng cộng</span>
                            <span className="font-bold text-base text-primary">
                              {formatPrice(order.finalAmount || order.totalAmount || 0)}
                            </span>
                          </div>
                        </div>
                      </section>

                      {/* Marketing UTM */}
                      {(order.utmSource || order.utmMedium || order.utmCampaign || order.marketingPlatform) && (
                        <section>
                          <Collapsible open={isUtmOpen} onOpenChange={setIsUtmOpen}>
                            <CollapsibleTrigger asChild>
                              <button className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors w-full group">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                                  <TrendingUp className="h-3.5 w-3.5" />
                                </div>
                                Marketing Attribution
                                <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${isUtmOpen ? "rotate-180" : ""}`} />
                              </button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="bg-muted/30 border rounded-xl p-4 mt-3 grid grid-cols-2 gap-3">
                                {order.marketingPlatform && (
                                  <InfoRow label="Platform" className="col-span-2" value={order.marketingPlatform} />
                                )}
                                {[
                                  ["utm_source", order.utmSource],
                                  ["utm_medium", order.utmMedium],
                                  ["utm_campaign", order.utmCampaign],
                                  ["utm_term", order.utmTerm],
                                  ["utm_content", order.utmContent],
                                ].filter(([, v]) => v).map(([key, val]) => (
                                  <InfoRow key={key as string} label={key as string} value={<span className="font-mono text-xs">{val}</span>} />
                                ))}
                                {order.marketingPlatformId && (
                                  <InfoRow label="Platform ID" className="col-span-2"
                                    value={<span className="font-mono text-xs break-all">{order.marketingPlatformId}</span>}
                                  />
                                )}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </section>
                      )}

                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* ── Tab: Cập nhật ── */}
                <TabsContent value="update" className="m-0">
                  <ScrollArea className="h-[calc(100vh-210px)]">
                    <div className="p-6 space-y-7">

                      {/* Trạng thái */}
                      <section className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                            <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <h3 className="font-semibold text-sm">Trạng thái đơn hàng</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="order-status" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              Trạng thái đơn
                            </Label>
                            <Select value={form.status || ""} onValueChange={(v) => updateForm("status", v)}>
                              <SelectTrigger id="order-status" className="h-9">
                                <SelectValue placeholder="Chọn trạng thái" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(orderStatusConfig).map(([key, cfg]) => (
                                  <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="payment-status" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              Trạng thái thanh toán
                            </Label>
                            <Select value={form.paymentStatus || ""} onValueChange={(v) => updateForm("paymentStatus", v)}>
                              <SelectTrigger id="payment-status" className="h-9">
                                <SelectValue placeholder="Chọn trạng thái TT" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(paymentStatusConfig).map(([key, cfg]) => (
                                  <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        {form.status === "CANCELLED" && (
                          <div className="flex items-start gap-2.5 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                            <span>Không thể hủy đơn đang giao hàng hoặc đã hoàn thành.</span>
                          </div>
                        )}
                      </section>

                      <Separator />

                      {/* Thông tin khách */}
                      <section className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <h3 className="font-semibold text-sm">Thông tin khách hàng</h3>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="customer-name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              Họ tên *
                            </Label>
                            <Input id="customer-name" className="h-9"
                              value={form.customerName || ""}
                              onChange={(e) => updateForm("customerName", e.target.value)}
                              placeholder="Nguyễn Văn A"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="customer-phone" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Số điện thoại
                              </Label>
                              <Input id="customer-phone" className="h-9"
                                value={form.customerPhone || ""}
                                onChange={(e) => updateForm("customerPhone", e.target.value)}
                                placeholder="0987654321"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="customer-email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Email
                              </Label>
                              <Input id="customer-email" type="email" className="h-9"
                                value={form.customerEmail || ""}
                                onChange={(e) => updateForm("customerEmail", e.target.value)}
                                placeholder="email@example.com"
                              />
                            </div>
                          </div>
                        </div>
                      </section>

                      <Separator />

                      {/* Địa chỉ */}
                      <section className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <h3 className="font-semibold text-sm">Địa chỉ giao hàng</h3>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="shipping-address" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              Địa chỉ chi tiết
                            </Label>
                            <Input id="shipping-address" className="h-9"
                              value={form.shippingAddress || ""}
                              onChange={(e) => updateForm("shippingAddress", e.target.value)}
                              placeholder="123 Đường ABC"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { id: "shipping-ward", key: "shippingWard", label: "Phường/Xã", placeholder: "Bến Nghé" },
                              { id: "shipping-district", key: "shippingDistrict", label: "Quận/Huyện", placeholder: "Quận 1" },
                              { id: "shipping-city", key: "shippingCity", label: "Tỉnh/Thành phố", placeholder: "TP.HCM" },
                            ].map(({ id, key, label, placeholder }) => (
                              <div key={id} className="space-y-2">
                                <Label htmlFor={id} className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                  {label}
                                </Label>
                                <Input id={id} className="h-9"
                                  value={(form as any)[key] || ""}
                                  onChange={(e) => updateForm(key as keyof UpdateOrderDto, e.target.value)}
                                  placeholder={placeholder}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </section>

                      <Separator />

                      {/* Ghi chú */}
                      <section className="space-y-2">
                        <Label htmlFor="notes" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Ghi chú
                        </Label>
                        <Textarea id="notes"
                          value={form.notes || ""}
                          onChange={(e) => updateForm("notes", e.target.value)}
                          placeholder="Gọi trước khi giao, giao giờ hành chính..."
                          rows={3}
                          className="resize-none"
                        />
                      </section>

                      {/* Save Button */}
                      <Button className="w-full h-10 text-sm font-semibold" onClick={handleSave} disabled={isSaving}>
                        {isSaving
                          ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          : <Save className="mr-2 h-4 w-4" />}
                        Lưu thay đổi
                      </Button>

                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* RIGHT: 2/5 — Activity Log */}
          <div className="xl:col-span-2">
            <Card className="overflow-hidden shadow-sm">
              <div className="border-b px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">Lịch sử cập nhật</h3>
                </div>
                <Badge variant="secondary" className="text-xs font-medium">
                  {fakeLog.length} sự kiện
                </Badge>
              </div>

              <ScrollArea className="h-[calc(100vh-210px)]">
                <div className="p-5">
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-4 bottom-4 w-px bg-border" />

                    <div className="space-y-5">
                      {fakeLog.map((event, index) => {
                        const iconCfg = activityIconMap[event.type];
                        const Icon = iconCfg.icon;
                        const isFirst = index === 0;

                        return (
                          <div key={event.id} className="relative pl-11">
                            {/* Icon bubble */}
                            <div className={`absolute left-0 top-1 h-8 w-8 rounded-full flex items-center justify-center z-10 border-2 border-background ${iconCfg.bg}`}>
                              <Icon className={`h-3.5 w-3.5 ${iconCfg.color}`} />
                            </div>

                            {/* Card */}
                            <div className={`rounded-xl border p-3.5 transition-colors ${isFirst ? "border-primary/40 bg-primary/5" : "bg-card"}`}>
                              {/* Actor + role */}
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <span className="text-xs font-bold text-foreground">{event.actor}</span>
                                {event.actorRole === "system" && (
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-cyan-50 text-cyan-700 border-cyan-200">
                                    Hệ thống
                                  </Badge>
                                )}
                                {event.actorRole === "admin" && (
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-blue-50 text-blue-700 border-blue-200">
                                    Admin
                                  </Badge>
                                )}
                              </div>

                              {/* Action */}
                              <p className="text-sm font-semibold text-foreground leading-snug">
                                {event.action}
                              </p>

                              {/* Detail */}
                              {event.detail && (
                                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                                  {event.detail}
                                </p>
                              )}

                              {/* Timestamp */}
                              <p className="text-[11px] text-muted-foreground/60 mt-2 flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" />
                                {formatDate(event.timestamp)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <p className="mt-6 text-center text-xs text-muted-foreground/40 italic">
                    * Dữ liệu demo — lịch sử thực sẽ kết nối từ API
                  </p>
                </div>
              </ScrollArea>
            </Card>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
};

export default OrderDetail;
