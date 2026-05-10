import React, { useState, useEffect } from "react";
import { Search, Filter, X, ChevronDown, Calendar as CalendarIcon, DollarSign, Tag } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrdersFindAllData } from "@vibe/shared";
import { format, parse } from "date-fns";

type FilterParams = OrdersFindAllData["query"] & {
  utmMedium?: string;
  utmCampaign?: string;
};

interface OrderFiltersProps {
  value: FilterParams;
  onFilterChange: (filters: FilterParams) => void;
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({ value, onFilterChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value.search || "");
  const [filters, setFilters] = useState<Omit<FilterParams, "search" | "page" | "limit">>({});

  // Helper to convert date from YYYY-MM-DD (API) to DD/MM/YYYY (Display)
  const toDisplayDate = (dateStr: string | undefined) => {
    if (!dateStr) return undefined;
    try {
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return format(date, "dd/MM/yyyy");
    } catch (e) {
      return dateStr;
    }
  };

  // Helper to convert date from DD/MM/YYYY (Display) to YYYY-MM-DD (API)
  const toApiDate = (dateStr: string | undefined) => {
    if (!dateStr) return undefined;
    try {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
      const parsedDate = parse(dateStr, "dd/MM/yyyy", new Date());
      if (isNaN(parsedDate.getTime())) return undefined;
      return format(parsedDate, "yyyy-MM-dd");
    } catch (e) {
      return undefined;
    }
  };

  // Sync local state when external value changes (e.g., via badge removal)
  useEffect(() => {
    setSearch(value.search || "");
    if (!open) {
      const { search: _s, ...rest } = value;
      // Convert dates to display format
      const displayFilters = {
        ...rest,
        dateFrom: toDisplayDate(rest.dateFrom),
        dateTo: toDisplayDate(rest.dateTo),
      };
      setFilters(displayFilters);
    }
  }, [value, open]);

  // Debounced exact search text
  useEffect(() => {
    const handler = setTimeout(() => {
      // Chỉ tự động update search text cùng với các filter ĐÃ ĐƯỢC APPLY (nằm trong value).
      // Tránh việc tự apply các filter đang chọn dở mà người dùng chưa bấm "Tìm kiếm"
      if (search !== value.search) {
        onFilterChange({ ...value, search: search || undefined });
      }
    }, 500);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Apply detailed filters
  const applyFilters = () => {
    // Convert dates back to API format
    const apiFilters = {
      ...filters,
      dateFrom: toApiDate(filters.dateFrom),
      dateTo: toApiDate(filters.dateTo),
    };
    // Lưu các trạng thái đang chọn thành parameter gọi API
    onFilterChange({ search: search || undefined, ...apiFilters });
    setOpen(false);
  };

  const handleReset = () => {
    onFilterChange({});
    setOpen(false);
  };
  const activeBadges = Object.entries(filters).filter(([_, val]) => val !== undefined && val !== "");

  const getFilterLabel = (key: string, val: any) => {
    switch (key) {
      case "status":
        const st: Record<string, string> = {
          PENDING: "Chờ xác nhận", CONFIRMED: "Đã xác nhận", PROCESSING: "Đang xử lý",
          SHIPPING: "Đang giao", COMPLETED: "Hoàn thành", CANCELLED: "Đã hủy"
        };
        return `Trạng thái: ${st[val] || val}`;
      case "paymentStatus":
        const pst: Record<string, string> = { PENDING: "Chưa TT", PAID: "Đã TT", FAILED: "Lỗi", REFUNDED: "Hoàn tiền" };
        return `Thanh toán: ${pst[val] || val}`;
      case "paymentMethod":
        return `PTVT: ${val === "COD" ? "Thanh toán khi nhận hàng" : "Chuyển khoản"}`;
      case "customerPhone": return `SĐT: ${val}`;
      case "dateFrom": 
        try {
          return `Từ: ${format(new Date(val), "dd/MM/yyyy")}`;
        } catch (e) {
          return `Từ: ${val}`;
        }
      case "dateTo": 
        try {
          return `Đến: ${format(new Date(val), "dd/MM/yyyy")}`;
        } catch (e) {
          return `Đến: ${val}`;
        }
      case "minAmount": return `Min: ₫${val}`;
      case "maxAmount": return `Max: ₫${val}`;
      case "utmSource": return `Source: ${val}`;
      case "utmMedium": return `Medium: ${val}`;
      case "utmCampaign": return `Campaign: ${val}`;
      default: return `${key}: ${val}`;
    }
  };

  return (
    <div className="w-full relative group">
      <Popover open={open} onOpenChange={setOpen}>
        <div className="flex items-center w-full border rounded-md bg-background transition-all shadow-sm">
            <div className="pl-3.5 flex items-center justify-center text-muted-foreground w-10">
              <Search className="h-4 w-4" />
            </div>
            
            <Input
              className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none px-1 h-10 truncate"
              placeholder="Tìm kiếm mã đơn, khách hàng, SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-10 px-3.5 rounded-none rounded-r-lg border-l text-muted-foreground hover:bg-muted/50 gap-2"
                onClick={() => setOpen(true)}
              >
                <Filter className="h-4 w-4" />
                Bộ lọc
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </PopoverTrigger>
          </div>

          <PopoverContent 
            className="w-[500px] p-0" 
            align="end"
            onInteractOutside={(e) => {
              // CHẶN AUTO-CLOSE: Ngăn Popover tự đóng khi bấm ra ngoài hoặc tương tác với Select Content của Radix.
              // Popover chỉ đóng khi bấm "Tìm kiếm", "Xoá bộ lọc", nút "Bộ lọc", hoặc phím Esc. 
              // Fix dứt điểm lỗi đang chọn trạng thái hệ thống lại đột ngột biến mất.
              e.preventDefault();
            }}
          >
            <div className="p-4 border-b">
              <h4 className="font-semibold text-sm">Tìm kiếm chi tiết (Bộ lọc nâng cao)</h4>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
              
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label className="text-xs text-muted-foreground uppercase">Số điện thoại chính xác</Label>
                <Input 
                  className="focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="Nhập SĐT..." 
                  value={filters.customerPhone || ""} 
                  onChange={(e) => setFilters({...filters, customerPhone: e.target.value})} 
                />
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label className="text-xs text-muted-foreground uppercase">Trạng thái đơn</Label>
                <Select value={filters.status || ""} onValueChange={(v: any) => setFilters({...filters, status: v})}>
                  <SelectTrigger className="focus:ring-0 focus:ring-offset-0"><SelectValue placeholder="Tất cả" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
                    <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
                    <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
                    <SelectItem value="SHIPPING">Đang giao</SelectItem>
                    <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                    <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label className="text-xs text-muted-foreground uppercase">Thanh toán</Label>
                <Select value={filters.paymentStatus || ""} onValueChange={(v: any) => setFilters({...filters, paymentStatus: v})}>
                  <SelectTrigger className="focus:ring-0 focus:ring-offset-0"><SelectValue placeholder="Tất cả" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Chưa TT</SelectItem>
                    <SelectItem value="PAID">Đã TT</SelectItem>
                    <SelectItem value="FAILED">Lỗi</SelectItem>
                    <SelectItem value="REFUNDED">Hoàn tiền</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label className="text-xs text-muted-foreground uppercase">Hình thức TT</Label>
                <Select value={filters.paymentMethod || ""} onValueChange={(v: any) => setFilters({...filters, paymentMethod: v})}>
                  <SelectTrigger className="focus:ring-0 focus:ring-offset-0"><SelectValue placeholder="Tất cả" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COD">Thanh toán khi nhận hàng (COD)</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Chuyển khoản</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <div className="relative group/date">
                  <Input 
                    className="focus-visible:ring-0 focus-visible:ring-offset-0 h-8 text-xs pr-8"
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={filters.dateFrom || ""} 
                    onChange={(e) => setFilters({...filters, dateFrom: e.target.value})} 
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-8 w-8 text-muted-foreground hover:text-primary">
                        <CalendarIcon className="h-3.5 w-3.5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={filters.dateFrom ? parse(filters.dateFrom, "dd/MM/yyyy", new Date()) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            setFilters(prev => ({...prev, dateFrom: format(date, "dd/MM/yyyy")}));
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label className="text-xs text-muted-foreground uppercase flex gap-1 items-center">
                  Đến ngày
                </Label>
                <div className="relative group/date">
                   <Input 
                    className="focus-visible:ring-0 focus-visible:ring-offset-0 h-8 text-xs pr-8"
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={filters.dateTo || ""} 
                    onChange={(e) => setFilters({...filters, dateTo: e.target.value})} 
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-8 w-8 text-muted-foreground hover:text-primary">
                        <CalendarIcon className="h-3.5 w-3.5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={filters.dateTo ? parse(filters.dateTo, "dd/MM/yyyy", new Date()) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            setFilters(prev => ({...prev, dateTo: format(date, "dd/MM/yyyy")}));
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label className="text-xs text-muted-foreground uppercase flex gap-1 items-center">
                  <DollarSign className="h-3 w-3" /> Giá trị tối thiểu
                </Label>
                <Input 
                  className="focus-visible:ring-0 focus-visible:ring-offset-0"
                  type="number" placeholder="VND"
                  value={filters.minAmount || ""} 
                  onChange={(e) => setFilters({...filters, minAmount: Number(e.target.value) || undefined})} 
                />
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label className="text-xs text-muted-foreground uppercase flex gap-1 items-center">
                  <DollarSign className="h-3 w-3" /> Giá trị tối đa
                </Label>
                <Input 
                  className="focus-visible:ring-0 focus-visible:ring-offset-0"
                  type="number" placeholder="VND"
                  value={filters.maxAmount || ""} 
                  onChange={(e) => setFilters({...filters, maxAmount: Number(e.target.value) || undefined})} 
                />
              </div>

              <div className="col-span-2 border-t pt-3 mt-1">
                <Label className="text-xs text-muted-foreground uppercase flex gap-1 items-center mb-3">
                  <Tag className="h-3 w-3" /> Marketing / UTM
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Input className="text-xs h-8 focus-visible:ring-0 focus-visible:ring-offset-0" placeholder="Source" value={filters.utmSource || ""} onChange={(e) => setFilters({...filters, utmSource: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <Input className="text-xs h-8 focus-visible:ring-0 focus-visible:ring-offset-0" placeholder="Medium" value={filters.utmMedium || ""} onChange={(e) => setFilters({...filters, utmMedium: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <Input className="text-xs h-8 focus-visible:ring-0 focus-visible:ring-offset-0" placeholder="Campaign" value={filters.utmCampaign || ""} onChange={(e) => setFilters({...filters, utmCampaign: e.target.value})} />
                  </div>
                </div>
              </div>

            </div>
            
            <div className="p-3 bg-muted/30 border-t flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground">
                Xóa bộ lọc
              </Button>
              <Button size="sm" onClick={applyFilters}>
                Tìm kiếm
              </Button>
            </div>
          </PopoverContent>
        </Popover>
    </div>
  );
};

export const OrderActiveBadges = ({
  filters,
  onFilterChange
}: {
  filters: FilterParams;
  onFilterChange: (filters: FilterParams) => void;
}) => {
  const activeBadges = Object.entries(filters).filter(
    ([key, val]) => val !== undefined && val !== "" && key !== "search"
  );
  
  if (activeBadges.length === 0) return null;

  const removeFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key as keyof FilterParams];
    onFilterChange(newFilters);
  };

  const getFilterLabel = (key: string, val: any) => {
    switch (key) {
      case "status":
        const st: Record<string, string> = {
          PENDING: "Chờ xác nhận", CONFIRMED: "Đã xác nhận", PROCESSING: "Đang xử lý",
          SHIPPING: "Đang giao", COMPLETED: "Hoàn thành", CANCELLED: "Đã hủy"
        };
        return `Trạng thái: ${st[val] || val}`;
      case "paymentStatus":
        const pst: Record<string, string> = { PENDING: "Chưa TT", PAID: "Đã TT", FAILED: "Lỗi", REFUNDED: "Hoàn tiền" };
        return `Thanh toán: ${pst[val] || val}`;
      case "paymentMethod":
        return `PTVT: ${val === "COD" ? "Thanh toán khi nhận hàng" : "Chuyển khoản"}`;
      case "customerPhone": return `SĐT: ${val}`;
      case "dateFrom": 
        try {
          return `Từ: ${format(new Date(val), "dd/MM/yyyy")}`;
        } catch (e) {
          return `Từ: ${val}`;
        }
      case "dateTo": 
        try {
          return `Đến: ${format(new Date(val), "dd/MM/yyyy")}`;
        } catch (e) {
          return `Đến: ${val}`;
        }
      case "minAmount": return `Min: ₫${val}`;
      case "maxAmount": return `Max: ₫${val}`;
      case "utmSource": return `Source: ${val}`;
      case "utmMedium": return `Medium: ${val}`;
      case "utmCampaign": return `Campaign: ${val}`;
      default: return `${key}: ${val}`;
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5 items-center pl-1">
      <span className="text-sm text-foreground font-medium mr-1 flex items-center gap-1.5">
        <Filter className="h-4 w-4"/> Lọc theo:
      </span>
      {activeBadges.map(([key, val]) => (
        <Badge key={key} variant="secondary" className="px-2 py-0.5 text-xs font-normal border-primary/20 flex items-center gap-1 shadow-sm">
          {getFilterLabel(key, val)}
          <X 
            className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors shrink-0 ml-1" 
            onClick={() => removeFilter(key)}
          />
        </Badge>
      ))}
      {activeBadges.length > 1 && (
        <button 
          onClick={() => onFilterChange({ search: filters.search })}
          className="text-xs text-muted-foreground hover:text-destructive hover:underline ml-1 px-2"
        >
          Xóa tất cả
        </button>
      )}
    </div>
  );
};
