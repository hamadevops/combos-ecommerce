import React, { useState, useEffect } from "react";
import { Search, Filter, X, ChevronDown, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ProductsFindAllData } from "@projects/shared";
import { useCategories } from "@/hooks/useCategories";
import { cn, formatPrice } from "@/lib/utils";

type FilterParams = ProductsFindAllData["query"];

interface ProductFiltersProps {
  value: FilterParams;
  onFilterChange: (filters: FilterParams) => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({ value, onFilterChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value?.search || "");
  const [filters, setFilters] = useState<Omit<FilterParams, "search" | "page" | "limit">>({});

  const { data: categoriesData } = useCategories();
  const categories = Array.isArray(categoriesData) ? categoriesData : categoriesData?.items || [];

  // Sync local state when external value changes
  useEffect(() => {
    setSearch(value?.search || "");
    const { search: _s, ...rest } = value || {};
    setFilters(rest);
  }, [value]);

  // Debounced exact search text
  useEffect(() => {
    const handler = setTimeout(() => {
      // Chỉ tự động update search text cùng với các filter ĐÃ ĐƯỢC APPLY (nằm trong value).
      if (search !== value?.search) {
        onFilterChange({ ...value, search: search || undefined });
      }
    }, 500);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Apply detailed filters
  const applyFilters = () => {
    onFilterChange({ search: search || undefined, ...filters });
    setOpen(false);
  };

  const handleReset = () => {
    onFilterChange({});
    setOpen(false);
  };

  const toggleCategory = (categoryId: number) => {
    setFilters(prev => {
      const catIds = prev.category_ids || [];
      const newCatIds = catIds.includes(categoryId)
        ? catIds.filter(id => id !== categoryId)
        : [...catIds, categoryId];
      return { ...prev, category_ids: newCatIds.length > 0 ? newCatIds : undefined };
    });
  };

  return (
    <div className="w-full relative group">
      <Popover open={open} onOpenChange={setOpen}>
        <div className="flex items-center w-[500px] border rounded-md bg-background transition-all shadow-sm">
          <div className="pl-3.5 flex items-center justify-center text-muted-foreground w-10">
            <Search className="h-4 w-4" />
          </div>
          
          <Input
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none px-1 h-10 truncate"
            placeholder="Tìm kiếm mã SKU, tên sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-10 px-3.5 rounded-none rounded-r-lg border-l text-muted-foreground hover:bg-muted/50 gap-2 shrink-0 max-w-[120px]"
              onClick={() => setOpen(true)}
            >
              <Filter className="h-4 w-4 shrink-0" />
              <span className="truncate">Bộ lọc</span>
              <ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
            </Button>
          </PopoverTrigger>
        </div>

        <PopoverContent 
          className="w-[500px] p-0" 
          align="start"
          onInteractOutside={(e) => {
            // Ngăn Popover tự đóng khi bấm ra ngoài hoặc tương tác với Select
            e.preventDefault();
          }}
        >
          <div className="p-4 border-b">
            <h4 className="font-semibold text-sm">Tìm kiếm chi tiết (Bộ lọc nâng cao)</h4>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
            
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label className="text-xs text-muted-foreground uppercase">Mã SKU</Label>
              <Input 
                className="focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Nhập mã SKU..." 
                value={filters.sku || ""} 
                onChange={(e) => setFilters({...filters, sku: e.target.value})} 
              />
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label className="text-xs text-muted-foreground uppercase">Danh mục</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between focus-visible:ring-0 focus-visible:ring-offset-0"
                  >
                    <span className="truncate">
                      {(filters.category_ids?.length || 0) > 0
                        ? `${filters.category_ids?.length} danh mục`
                        : "Chọn danh mục"}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Tìm..." className="h-9 focus-visible:ring-0 focus-visible:ring-offset-0"/>
                    <CommandList>
                      <CommandEmpty>Không tìm thấy.</CommandEmpty>
                      <CommandGroup>
                        {categories.map((cat: any) => (
                          <CommandItem
                            key={cat.id}
                            value={cat.name}
                            onSelect={() => toggleCategory(cat.id)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                filters.category_ids?.includes(cat.id) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {cat.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label className="text-xs text-muted-foreground uppercase">Tồn kho (Min)</Label>
              <Input 
                type="number"
                min={0}
                className="focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="0" 
                value={filters.minStock || ""} 
                onChange={(e) => setFilters({...filters, minStock: e.target.value ? Number(e.target.value) : undefined})} 
              />
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label className="text-xs text-muted-foreground uppercase">Tồn kho (Max)</Label>
              <Input 
                type="number"
                min={0}
                className="focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="1000" 
                value={filters.maxStock || ""} 
                onChange={(e) => setFilters({...filters, maxStock: e.target.value ? Number(e.target.value) : undefined})} 
              />
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label className="text-xs text-muted-foreground uppercase">Giá thấp nhất</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₫</span>
                <Input 
                  type="number"
                  min={0}
                  className="pl-7 focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="0" 
                  value={filters.min_price || ""} 
                  onChange={(e) => setFilters({...filters, min_price: e.target.value ? Number(e.target.value) : undefined})} 
                />
              </div>
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label className="text-xs text-muted-foreground uppercase">Giá cao nhất</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₫</span>
                <Input 
                  type="number"
                  min={0}
                  className="pl-7 focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="50,000,000" 
                  value={filters.max_price || ""} 
                  onChange={(e) => setFilters({...filters, max_price: e.target.value ? Number(e.target.value) : undefined})} 
                />
              </div>
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label className="text-xs text-muted-foreground uppercase">Trạng thái (Hiển thị)</Label>
              <Select 
                value={filters.isActive !== undefined ? String(filters.isActive) : "all"} 
                onValueChange={(v: any) => setFilters({...filters, isActive: v !== "all" ? Number(v) as 0|1 : undefined})}
              >
                <SelectTrigger className="focus:ring-0 focus:ring-offset-0"><SelectValue placeholder="Tất cả" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="1">Hiển thị</SelectItem>
                  <SelectItem value="0">Đã ẩn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label className="text-xs text-muted-foreground uppercase">Sản phẩm nổi bật</Label>
              <Select 
                value={filters.isFeatured !== undefined ? String(filters.isFeatured) : "all"} 
                onValueChange={(v: any) => setFilters({...filters, isFeatured: v !== "all" ? Number(v) as 0|1 : undefined})}
              >
                <SelectTrigger className="focus:ring-0 focus:ring-offset-0"><SelectValue placeholder="Tất cả" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="1">Nổi bật</SelectItem>
                  <SelectItem value="0">Thường</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label className="text-xs text-muted-foreground uppercase">Sản phẩm đề xuất</Label>
              <Select 
                value={filters.isRecommended !== undefined ? String(filters.isRecommended) : "all"} 
                onValueChange={(v: any) => setFilters({...filters, isRecommended: v !== "all" ? Number(v) as 0|1 : undefined})}
              >
                <SelectTrigger className="focus:ring-0 focus:ring-offset-0"><SelectValue placeholder="Tất cả" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="1">Đề xuất</SelectItem>
                  <SelectItem value="0">Thường</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label className="text-xs text-muted-foreground uppercase">Sắp xếp theo</Label>
              <Select 
                value={filters.sort || "all"} 
                onValueChange={(v: any) => setFilters({...filters, sort: v !== "all" ? v : undefined})}
              >
                <SelectTrigger className="focus:ring-0 focus:ring-offset-0"><SelectValue placeholder="Mặc định" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Mặc định</SelectItem>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="best_selling">Bán chạy nhất</SelectItem>
                  <SelectItem value="price_asc">Giá (Thấp đến cao)</SelectItem>
                  <SelectItem value="price_desc">Giá (Cao đến thấp)</SelectItem>
                  <SelectItem value="name_asc">Tên (A-Z)</SelectItem>
                  <SelectItem value="name_desc">Tên (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>
          
          <div className="p-3 bg-muted/30 border-t flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground">
              Xóa bộ lọc
            </Button>
            <Button size="sm" onClick={applyFilters}>
              Lọc kết quả
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export const ProductActiveBadges = ({
  filters,
  onFilterChange
}: {
  filters: FilterParams;
  onFilterChange: (filters: FilterParams) => void;
}) => {
  const { data: categoriesData } = useCategories();
  const categories = Array.isArray(categoriesData) ? categoriesData : categoriesData?.items || [];
  
  const activeBadges = Object.entries(filters || {}).filter(
    ([key, val]) => val !== undefined && val !== "" && key !== "search" && key !== "page" && key !== "limit"
  );
  
  if (activeBadges.length === 0) return null;

  const removeFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key as keyof FilterParams];
    onFilterChange(newFilters);
  };

  const getFilterLabel = (key: string, val: any) => {
    switch (key) {
      case "sku":
        return `SKU: ${val}`;
      case "isActive":
        return `Trạng thái: ${val === 1 ? 'Hiển thị' : 'Đã ẩn'}`;
      case "isFeatured":
        return `Nổi bật: ${val === 1 ? 'Có' : 'Không'}`;
      case "isRecommended":
        return `Đề xuất: ${val === 1 ? 'Có' : 'Không'}`;
      case "min_price": 
        return `Giá Min: ${formatPrice(val)}`;
      case "max_price": 
        return `Giá Max: ${formatPrice(val)}`;
      case "minStock":
        return `Tồn Min: ${val}`;
      case "maxStock":
        return `Tồn Max: ${val}`;
      case "sort":
        const sortMap: Record<string, string> = {
          newest: "Mới nhất",
          best_selling: "Bán chạy nhất",
          price_asc: "Giá từ thấp đến cao",
          price_desc: "Giá từ cao đến thấp",
          name_asc: "Tên (A-Z)",
          name_desc: "Tên (Z-A)",
          display_order_asc: "Thứ tự sắp xếp"
        };
        return `Sắp xếp: ${sortMap[val] || val}`;
      case "category_ids":
        const count = Array.isArray(val) ? val.length : 0;
        if (count === 0) return null;
        if (count === 1) {
          const c = categories.find((c: any) => c.id === val[0]);
          return c ? `Danh mục: ${c.name}` : `Danh mục: ${val[0]}`;
        }
        return `Danh mục: ${count} mục`;
      case "categoryIds":
        return null; // Ignore alias
      default: 
        return `${key}: ${val}`;
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5 items-center pl-1">
      <span className="text-sm text-foreground font-medium mr-1 flex items-center gap-1.5">
        <Filter className="h-4 w-4"/> Lọc theo:
      </span>
      {activeBadges.map(([key, val]) => {
        const label = getFilterLabel(key, val);
        if (!label) return null;
        
        return (
          <Badge key={key} variant="secondary" className="px-2 py-0.5 text-xs font-normal border-primary/20 flex items-center gap-1 shadow-sm">
            {label}
            <X 
              className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors shrink-0 ml-1" 
              onClick={() => removeFilter(key)}
            />
          </Badge>
        );
      })}
      {activeBadges.length > 1 && (
        <button 
          onClick={() => onFilterChange({ search: filters?.search })}
          className="text-xs text-muted-foreground hover:text-destructive hover:underline ml-1 px-2"
        >
          Xóa tất cả
        </button>
      )}
    </div>
  );
};
