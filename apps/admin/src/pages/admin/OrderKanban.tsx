import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
  useDraggable,
  closestCenter,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { formatPrice } from "@/lib/utils";


// ─── Component hiển thị số chạy ───────────────────────────────────────────────

const AnimatedPrice = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 600; // ms
    const initialValue = displayValue;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing function easeOutQuint cho mượt
      const easeOutQuint = 1 - Math.pow(1 - progress, 5);
      
      const current = Math.floor(initialValue + (value - initialValue) * easeOutQuint);
      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    window.requestAnimationFrame(step);
  }, [value]);

  return <>{formatPrice(displayValue)}</>;
};

import {
  Clock,
  CheckCircle,
  Package,
  Truck,
  XCircle,
  GripVertical,
  User,
  Calendar,
  ShoppingBag,
  CreditCard,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUpdateOrder } from "@/hooks/useOrders";
import { toast } from "sonner";

// ─── Status config ────────────────────────────────────────────────────────────

export const COLUMN_ORDER = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPING",
  "COMPLETED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof COLUMN_ORDER)[number];

const columnConfig: Record<
  OrderStatus,
  { label: string; color: string; headerBg: string; icon: any; dotColor: string }
> = {
  PENDING: {
    label: "Chờ xác nhận",
    color: "text-yellow-700",
    headerBg: "bg-yellow-50 border-yellow-200",
    dotColor: "bg-yellow-400",
    icon: Clock,
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    color: "text-blue-700",
    headerBg: "bg-blue-50 border-blue-200",
    dotColor: "bg-blue-400",
    icon: CheckCircle,
  },
  PROCESSING: {
    label: "Đang xử lý",
    color: "text-indigo-700",
    headerBg: "bg-indigo-50 border-indigo-200",
    dotColor: "bg-indigo-400",
    icon: Package,
  },
  SHIPPING: {
    label: "Đang giao",
    color: "text-purple-700",
    headerBg: "bg-purple-50 border-purple-200",
    dotColor: "bg-purple-400",
    icon: Truck,
  },
  COMPLETED: {
    label: "Hoàn thành",
    color: "text-green-700",
    headerBg: "bg-green-50 border-green-200",
    dotColor: "bg-green-400",
    icon: CheckCircle,
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "text-red-700",
    headerBg: "bg-red-50 border-red-200",
    dotColor: "bg-red-400",
    icon: XCircle,
  },
};

const paymentBadge: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Chưa TT", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  PAID: { label: "Đã TT", className: "bg-green-100 text-green-700 border-green-200" },
  FAILED: { label: "TT Lỗi", className: "bg-red-100 text-red-700 border-red-200" },
  REFUNDED: { label: "Hoàn tiền", className: "bg-gray-100 text-gray-600 border-gray-200" },
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });

const formatDateTime = (d: string) =>
  new Date(d).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

// ─── Order Card ───────────────────────────────────────────────────────────────

interface OrderCardData {
  id: number;
  code?: string;
  customerName?: string;
  customerPhone?: string;
  totalAmount?: number;
  finalAmount?: number;
  paymentStatus?: string;
  status?: string;
  items?: any[];
  createdAt: string;
  updatedAt?: string;
}

const OrderCard = ({
  order,
  isDragging = false,
}: {
  order: OrderCardData;
  isDragging?: boolean;
}) => {
  const navigate = useNavigate();
  const payment =
    paymentBadge[(order.paymentStatus || "PENDING").toUpperCase()] || paymentBadge["PENDING"];
  const itemCount = order.items?.reduce((acc: number, i: any) => acc + (i.quantity || 1), 0) || 0;

  return (
    <div
      className={`bg-card border rounded-xl p-3 space-y-2.5 select-none transition-all ${
        isDragging
          ? "shadow-2xl opacity-95 scale-[1.02] border-primary/40 rotate-1"
          : "shadow-sm hover:shadow-md hover:border-muted-foreground/20"
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <button
          className="font-mono text-xs font-bold text-primary hover:underline truncate text-left"
          onClick={() => navigate(`/orders/${order.id}`)}
        >
          {order.code || `#${order.id}`}
        </button>
        <Badge variant="outline" className={`${payment.className} text-[10px] px-1.5 py-0 h-4 shrink-0`}>
          {payment.label}
        </Badge>
      </div>

      {/* Customer */}
      <div className="flex items-center gap-1.5">
        <User className="h-3 w-3 text-muted-foreground shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-semibold truncate">{order.customerName || "—"}</p>
          {order.customerPhone && (
            <p className="text-[11px] text-muted-foreground">{order.customerPhone}</p>
          )}
        </div>
      </div>

      {/* Footer row */}
      <div className="flex flex-col gap-1.5 pt-1.5 border-t">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground" title="Số sản phẩm">
            <ShoppingBag className="h-2.5 w-2.5" />
            {itemCount} SP
          </span>
          <span className="text-xs font-bold text-foreground">
            {formatPrice(order.finalAmount || order.totalAmount || 0)}
          </span>
        </div>
        
        <div className="flex flex-col gap-0.5 mt-0.5 border-t pt-1.5">
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground" title="Thời gian đặt hàng">
            <Calendar className="h-2.5 w-2.5 opacity-70" />
            <span className="opacity-80">Đặt:</span> {formatDateTime(order.createdAt)}
          </span>
          {order.updatedAt && order.updatedAt !== order.createdAt && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground" title="Lần cập nhật cuối">
              <Clock className="h-2.5 w-2.5 opacity-70" />
              <span className="opacity-80">Cập nhật:</span> {formatDateTime(order.updatedAt)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Draggable Card wrapper ───────────────────────────────────────────────────

const DraggableCard = ({ order }: { order: OrderCardData }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: order.id,
    data: { order },
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.4 : 1 }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Grip handle */}
      <div
        {...listeners}
        {...attributes}
        className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 cursor-grab active:cursor-grabbing
                   opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className={`transition-all ${isDragging ? "opacity-40" : ""} pl-1`}>
        <OrderCard order={order} />
      </div>
    </div>
  );
};

// ─── Droppable Column ─────────────────────────────────────────────────────────

const KanbanColumn = ({
  status,
  orders,
  isOver,
}: {
  status: OrderStatus;
  orders: OrderCardData[];
  isOver: boolean;
}) => {
  const cfg = columnConfig[status];
  const Icon = cfg.icon;
  const { setNodeRef } = useDroppable({ id: status });

  const totalAmount = orders.reduce((sum, order) => sum + (order.finalAmount || order.totalAmount || 0), 0);

  return (
    <div className="flex flex-col min-w-[240px] w-[240px] xl:w-auto xl:flex-1">
      {/* Column header */}
      <div className={`flex flex-col justify-center px-3 py-2.5 rounded-t-xl border ${cfg.headerBg} mb-0`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={`h-2 w-2 rounded-full ${cfg.dotColor} shrink-0`} />
          <Icon className={`h-3.5 w-3.5 ${cfg.color} shrink-0`} />
          <span className={`text-xs font-bold ${cfg.color} flex-1 truncate`}>{cfg.label}</span>
          <span className={`text-xs font-bold ${cfg.color} bg-white/60 rounded-full px-2 py-0 min-w-[22px] text-center`}>
            {orders.length}
          </span>
        </div>
        <div className={`text-xs font-semibold ${cfg.color} pl-4 opacity-90`}>
          Tổng: <AnimatedPrice value={totalAmount} />
        </div>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[500px] rounded-b-xl border border-t-0 p-2.5 space-y-2.5 transition-all duration-150 ${
          isOver
            ? "bg-primary/5 border-primary/30"
            : "bg-muted/20 border-muted-foreground/10"
        }`}
      >
        {orders.map((order) => (
          <DraggableCard key={order.id} order={order} />
        ))}

        {orders.length === 0 && (
          <div
            className={`flex flex-col items-center justify-center h-20 rounded-lg border-2 border-dashed text-xs text-muted-foreground/50 transition-colors ${
              isOver ? "border-primary/40 text-primary/50" : "border-muted-foreground/20"
            }`}
          >
            {isOver ? "Thả vào đây" : "Trống"}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Kanban Board ────────────────────────────────────────────────────────

interface OrderKanbanProps {
  orders: OrderCardData[];
}

export const OrderKanban = ({ orders }: OrderKanbanProps) => {
  const { mutate: updateOrder } = useUpdateOrder();

  // Local state for optimistic updates
  const [localOrders, setLocalOrders] = useState<OrderCardData[]>(orders);
  const [activeOrder, setActiveOrder] = useState<OrderCardData | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  // Sync when prop changes (e.g. after refetch or filtering)
  useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }, // 8px drag threshold to allow clicks
    }),
  );

  // Group orders by status
  const grouped = COLUMN_ORDER.reduce(
    (acc, status) => {
      acc[status] = localOrders.filter(
        (o) => (o.status || "PENDING").toUpperCase() === status,
      );
      return acc;
    },
    {} as Record<OrderStatus, OrderCardData[]>,
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const order = localOrders.find((o) => o.id === event.active.id);
    if (order) setActiveOrder(order);
  }, [localOrders]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    setOverId(event.over?.id ? String(event.over.id) : null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveOrder(null);
      setOverId(null);

      const { active, over } = event;
      if (!over) return;

      const orderId = Number(active.id);
      const newStatus = String(over.id) as OrderStatus;

      // Only update if dropped in a valid column
      if (!COLUMN_ORDER.includes(newStatus as OrderStatus)) return;

      const order = localOrders.find((o) => o.id === orderId);
      if (!order) return;

      const oldStatus = (order.status || "PENDING").toUpperCase();
      if (oldStatus === newStatus) return;

      // Validate: can't cancel COMPLETED or SHIPPING
      if (newStatus === "CANCELLED" && (oldStatus === "COMPLETED" || oldStatus === "SHIPPING")) {
        toast.error(
          `Không thể hủy đơn đang "${columnConfig[oldStatus as OrderStatus]?.label}".`,
        );
        return;
      }

      // Optimistic update - đưa lên đầu danh sách để hiển thị ở trên cùng
      setLocalOrders((prev) => {
        const orderIdx = prev.findIndex((o) => o.id === orderId);
        if (orderIdx === -1) return prev;
        const updatedOrder = { 
          ...prev[orderIdx], 
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
        const newArray = [...prev];
        newArray.splice(orderIdx, 1);
        newArray.unshift(updatedOrder);
        return newArray;
      });

      // API call
      updateOrder(
        { id: orderId, data: { status: newStatus } },
        {
          onError: () => {
            // Rollback
            setLocalOrders((prev) =>
              prev.map((o) => (o.id === orderId ? { ...o, status: oldStatus } : o)),
            );
          },
        },
      );
    },
    [localOrders, updateOrder],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {/* Horizontal scroll container */}
      <div className="flex gap-3 overflow-x-auto pb-4 xl:grid xl:grid-cols-6">
        {COLUMN_ORDER.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            orders={grouped[status]}
            isOver={overId === status}
          />
        ))}
      </div>

      {/* Drag overlay — floating card while dragging */}
      <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
        {activeOrder ? <OrderCard order={activeOrder} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default OrderKanban;
