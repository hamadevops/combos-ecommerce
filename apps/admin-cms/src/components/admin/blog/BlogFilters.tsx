import React, { useState, useEffect } from "react";
import { Search, Filter, X, ChevronDown, Check, Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { PostsFindAllData } from "@vibe/shared";
import { useTopics } from "@/hooks/useTopics";
import { useTags } from "@/hooks/useTags";
import { useUsers } from "@/hooks/useUsers";
import { cn, formatDate } from "@/lib/utils";
import { format, parse } from "date-fns";

type FilterParams = PostsFindAllData["query"];

interface BlogFiltersProps {
  value: FilterParams;
  onFilterChange: (filters: FilterParams) => void;
}

export const BlogFilters: React.FC<BlogFiltersProps> = ({ value, onFilterChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value?.search || "");
  const [filters, setFilters] = useState<Omit<FilterParams, "search" | "page" | "limit">>({});

  const { data: topicsData } = useTopics();
  const { data: tagsData } = useTags({ limit: 100 });
  const { data: usersData } = useUsers({ limit: 100 });

  const topics = Array.isArray(topicsData?.data) ? topicsData.data : (topicsData as any)?.data?.items || [];
  const tags = Array.isArray(tagsData?.data) ? tagsData.data : (tagsData as any)?.items || [];
  const users = Array.isArray(usersData?.data) ? usersData.data : (usersData as any)?.data?.items || [];

  // Helper to convert date from YYYY-MM-DD (API) to DD/MM/YYYY (Display)
  const toDisplayDate = (dateStr: string | undefined) => {
    if (!dateStr) return undefined;
    try {
      // If it's already in DD/MM/YYYY, return it
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
      // If it's already in YYYY-MM-DD, return it
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
      const parsedDate = parse(dateStr, "dd/MM/yyyy", new Date());
      if (isNaN(parsedDate.getTime())) return undefined;
      return format(parsedDate, "yyyy-MM-dd");
    } catch (e) {
      return undefined;
    }
  };

  // Sync local state when external value changes
  useEffect(() => {
    setSearch(value?.search || "");
    
    // Only sync filters from parent if Popover is CLOSED.
    // When open, the user is "staging" changes locally.
    if (!open) {
      const { search: _s, page: _p, limit: _l, ...rest } = value || {};
      // Convert dates to display format
      const displayFilters = {
        ...rest,
        start_date: toDisplayDate(rest.start_date),
        end_date: toDisplayDate(rest.end_date),
      };
      setFilters(displayFilters);
    }
  }, [value, open]);

  // Debounced search text
  useEffect(() => {
    const handler = setTimeout(() => {
      // Comparison specifically with value.search to avoid unnecessary updates
      if (search !== (value?.search || "")) {
        // When search updates, merge with ALREADY APPLIED filters in 'value'
        // NOT the staged 'filters' state (which hasn't been submitted yet)
        onFilterChange({ ...value, search: search || undefined });
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [search, onFilterChange, value?.search]); // Restricted dependencies

  // Apply detailed filters
  const applyFilters = () => {
    const apiFilters = {
      ...filters,
      start_date: toApiDate(filters.start_date),
      end_date: toApiDate(filters.end_date),
    };
    onFilterChange({ ...value, search: search || undefined, ...apiFilters });
    setOpen(false);
  };

  const handleReset = () => {
    onFilterChange({});
    setOpen(false);
  };

  const toggleTopic = (topicId: number) => {
    setFilters(prev => {
      const ids = prev.topic_ids || [];
      const newIds = ids.includes(topicId)
        ? ids.filter(id => id !== topicId)
        : [...ids, topicId];
      return { ...prev, topic_ids: newIds.length > 0 ? newIds : undefined };
    });
  };

  const toggleTag = (tagId: number) => {
    setFilters(prev => {
      const ids = prev.tag_ids || [];
      const newIds = ids.includes(tagId)
        ? ids.filter(id => id !== tagId)
        : [...ids, tagId];
      return { ...prev, tag_ids: newIds.length > 0 ? newIds : undefined };
    });
  };

  return (
    <div className="w-full relative group">
      <Popover open={open} onOpenChange={setOpen}>
        <div className="flex items-center w-full max-w-[500px] border rounded-md bg-background transition-all shadow-sm focus-within:ring-1 focus-within:ring-primary/20">
          <div className="pl-3.5 flex items-center justify-center text-muted-foreground w-10">
            <Search className="h-4 w-4" />
          </div>
          
          <Input
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none px-1 h-10 truncate"
            placeholder="Tìm kiếm bài viết, tiêu đề, nội dung..."
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
              <span className="truncate hidden sm:inline">Bộ lọc</span>
              <ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
            </Button>
          </PopoverTrigger>
        </div>

        <PopoverContent 
          className="w-[350px] sm:w-[500px] p-0 shadow-xl" 
          align="start"
          onInteractOutside={(e) => {
             // Ngăn đóng khi làm việc với Dropdown / Date picker bên trong
             const target = e.target as HTMLElement;
             if (target?.closest('[role="combobox"]') || target?.closest('[role="listbox"]')) {
                e.preventDefault();
             }
          }}
        >
          <div className="p-4 border-b bg-muted/10">
            <h4 className="font-semibold text-sm">Bộ lọc nâng cao (Bài viết)</h4>
          </div>
          
          <div className="p-4 grid grid-cols-2 gap-4 max-h-[450px] overflow-y-auto scrollbar-thin">
            
            {/* Topics Multi-select */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Chủ đề</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between h-9 text-xs">
                    <span className="truncate">
                      {(filters.topic_ids?.length || 0) > 0
                        ? `${filters.topic_ids?.length} chủ đề`
                        : "Chọn chủ đề"}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Tìm chủ đề..." className="h-9"/>
                    <CommandList>
                      <CommandEmpty>Không tìm thấy.</CommandEmpty>
                      <CommandGroup>
                        {topics.map((item: any) => (
                          <CommandItem key={item.id} value={item.name} onSelect={() => toggleTopic(item.id)}>
                            <Check className={cn("mr-2 h-4 w-4", filters.topic_ids?.includes(item.id) ? "opacity-100" : "opacity-0")} />
                            {item.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Tags Multi-select */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Thẻ (Tags)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between h-9 text-xs">
                    <span className="truncate">
                      {(filters.tag_ids?.length || 0) > 0
                        ? `${filters.tag_ids?.length} thẻ`
                        : "Chọn thẻ"}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Tìm thẻ..." className="h-9"/>
                    <CommandList>
                      <CommandEmpty>Không tìm thấy.</CommandEmpty>
                      <CommandGroup>
                        {tags.map((item: any) => (
                          <CommandItem key={item.id} value={item.name} onSelect={() => toggleTag(item.id)}>
                            <Check className={cn("mr-2 h-4 w-4", filters.tag_ids?.includes(item.id) ? "opacity-100" : "opacity-0")} />
                            {item.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Author */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Tác giả</Label>
              <Select 
                value={filters.author_id !== undefined ? String(filters.author_id) : "all"} 
                onValueChange={(v) => setFilters(prev => ({...prev, author_id: v !== "all" ? Number(v) : undefined}))}
              >
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Tất cả tác giả" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {users.map((u: any) => (
                    <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Published */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Trạng thái đăng</Label>
              <Select 
                value={filters.is_published !== undefined ? String(filters.is_published) : "all"} 
                onValueChange={(v) => setFilters(prev => ({...prev, is_published: v !== "all" ? v === "true" : undefined}))}
              >
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Tất cả" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="true">Công khai</SelectItem>
                  <SelectItem value="false">Bản nháp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Thumbnails */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Hình đại diện</Label>
              <Select 
                value={filters.has_thumbnail !== undefined ? String(filters.has_thumbnail) : "all"} 
                onValueChange={(v) => setFilters(prev => ({...prev, has_thumbnail: v !== "all" ? v === "true" : undefined}))}
              >
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Tất cả" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="true">Có hình</SelectItem>
                  <SelectItem value="false">Không hình</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Min Views */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Lượt xem tối thiểu</Label>
              <Input 
                type="number"
                className="h-9 text-xs"
                placeholder="0" 
                value={filters.min_views || ""} 
                onChange={(e) => setFilters(prev => ({...prev, min_views: e.target.value ? Number(e.target.value) : undefined}))} 
              />
            </div>

            {/* Published Range */}
            <div className="space-y-1.5 col-span-2 pt-1 border-t">
              <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Dải ngày xuất bản</Label>
              <div className="grid grid-cols-2 gap-2">
                {/* Start Date */}
                <div className="relative group/date">
                  <Input 
                    type="text"
                    className="h-8 text-xs pr-8"
                    placeholder="Từ: DD/MM/YYYY"
                    value={filters.start_date || ""} 
                    onChange={(e) => setFilters(prev => ({...prev, start_date: e.target.value || undefined}))} 
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
                        selected={filters.start_date ? parse(filters.start_date, "dd/MM/yyyy", new Date()) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            setFilters(prev => ({...prev, start_date: format(date, "dd/MM/yyyy")}));
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* End Date */}
                <div className="relative group/date">
                  <Input 
                    type="text"
                    className="h-8 text-xs pr-8"
                    placeholder="Đến: DD/MM/YYYY"
                    value={filters.end_date || ""} 
                    onChange={(e) => setFilters(prev => ({...prev, end_date: e.target.value || undefined}))} 
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
                        selected={filters.end_date ? parse(filters.end_date, "dd/MM/yyyy", new Date()) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            setFilters(prev => ({...prev, end_date: format(date, "dd/MM/yyyy")}));
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Sorting */}
            <div className="space-y-1.5 col-span-2 pt-1 border-t">
              <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Sắp xếp</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select 
                  value={filters.sort_by || "createdAt"} 
                  onValueChange={(v: any) => setFilters(prev => ({...prev, sort_by: v}))}
                >
                  <SelectTrigger className="h-8 text-[11px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Ngày tạo</SelectItem>
                    <SelectItem value="publishedAt">Ngày đăng</SelectItem>
                    <SelectItem value="title">Tiêu đề</SelectItem>
                    <SelectItem value="views">Lượt xem</SelectItem>
                  </SelectContent>
                </Select>
                <Select 
                  value={filters.sort_order || "DESC"} 
                  onValueChange={(v: "ASC" | "DESC") => setFilters(prev => ({...prev, sort_order: v}))}
                >
                  <SelectTrigger className="h-8 text-[11px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DESC">Giảm dần</SelectItem>
                    <SelectItem value="ASC">Tăng dần</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

          </div>
          
          <div className="p-3 bg-muted/30 border-t flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs text-muted-foreground hover:text-destructive">
              Xóa bộ lọc
            </Button>
            <Button size="sm" onClick={applyFilters} className="h-8 text-xs px-4">
              Lọc kết quả
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export const BlogActiveBadges = ({
  filters,
  onFilterChange
}: {
  filters: FilterParams;
  onFilterChange: (filters: FilterParams) => void;
}) => {
  const { data: topicsData } = useTopics();
  const { data: tagsData } = useTags({ limit: 100 });
  const { data: usersData } = useUsers({ limit: 100 });

  const topics = Array.isArray(topicsData?.data) ? topicsData.data : (topicsData as any)?.data?.items || [];
  const tags = Array.isArray(tagsData?.data) ? tagsData.data : (tagsData as any)?.items || [];
  const users = Array.isArray(usersData?.data) ? usersData.data : (usersData as any)?.data?.items || [];
  
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
      case "topic_ids":
        const tCount = Array.isArray(val) ? val.length : 0;
        if (tCount === 1) {
          const t = topics.find((item: any) => item.id === val[0]);
          return `Chủ đề: ${t?.name || val[0]}`;
        }
        return `Chủ đề: ${tCount} mục`;
      case "tag_ids":
        const tagsCount = Array.isArray(val) ? val.length : 0;
        if (tagsCount === 1) {
          const t = tags.find((item: any) => item.id === val[0]);
          return `Thẻ: ${t?.name || val[0]}`;
        }
        return `Thẻ: ${tagsCount} mục`;
      case "author_id":
        const u = users.find((u: any) => u.id === Number(val));
        return `Tác giả: ${u?.name || val}`;
      case "is_published":
        return `Trạng thái: ${val === true ? 'Công khai' : 'Bản nháp'}`;
      case "has_thumbnail":
        return `Hình ảnh: ${val === true ? 'Có' : 'Không'}`;
      case "min_views":
        return `Lượt xem >= ${val}`;
      case "start_date":
        try {
          return `Từ: ${format(new Date(val), "dd/MM/yyyy")}`;
        } catch (e) {
          return `Từ: ${val}`;
        }
      case "end_date":
        try {
          return `Đến: ${format(new Date(val), "dd/MM/yyyy")}`;
        } catch (e) {
          return `Đến: ${val}`;
        }
      case "sort_by":
        const map: any = { createdAt: 'Ngày tạo', publishedAt: 'Ngày đăng', title: 'Tiêu đề', views: 'Lượt xem' };
        return `Sắp xếp: ${map[val] || val}`;
      case "sort_order":
        return `Hướng: ${val === 'ASC' ? 'Tăng dần' : 'Giảm dần'}`;
      default: 
        return null;
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5 items-center pl-1 mt-2">
      <span className="text-[11px] text-muted-foreground mr-1 flex items-center gap-1">
        <Filter className="h-3 w-3"/> Lọc theo:
      </span>
      {activeBadges.map(([key, val]) => {
        const label = getFilterLabel(key, val);
        if (!label) return null;
        
        return (
          <Badge key={key} variant="secondary" className="px-1.5 py-0 text-[10px] font-normal border-primary/10 flex items-center gap-1 shadow-sm h-5">
            {label}
            <X className="h-2.5 w-2.5 cursor-pointer hover:text-destructive" onClick={() => removeFilter(key)} />
          </Badge>
        );
      })}
      {activeBadges.length > 1 && (
        <button 
          onClick={() => onFilterChange({ search: filters?.search })}
          className="text-[10px] text-muted-foreground hover:text-destructive hover:underline ml-1"
        >
          Xóa tất cả
        </button>
      )}
    </div>
  );
};
