import { useState, useEffect, useRef } from "react";
import { Control, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Plus, Trash2, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Suggested specification keys for autocomplete
const SUGGESTED_SPEC_KEYS = [
  "Model",
  "Điện áp pin",
  "Tốc độ đập",
  "Tốc độ linh hoạt",
  "Tốc độ tối đa",
  "Bộ sản phẩm gồm",
  "Trọng lượng",
  "Trọng lượng (khi lắp pin)",
  "Bảo hành",
  "Pin",
  "Động cơ",
  "5 cấp chỉnh tốc",
  "Công tắc",
  "Trục chính",
  "Đường kính cắt",
  "Công suất",
  "Lực siết",
  "Chân pin",
  "3 chức năng",
  "Tính năng",
  "Xuất xứ",
  "Thương hiệu",
  "Chất liệu",
  "Kích thước",
  "Màu sắc",
];

interface SpecificationEntry {
  key: string;
  value: string;
}

interface SpecKeyComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

function SpecKeyCombobox({ value, onChange }: SpecKeyComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setSearchValue("");
    setOpen(false);
  };

  // Filter suggestions based on search
  const filteredSuggestions = SUGGESTED_SPEC_KEYS.filter((key) =>
    key.toLowerCase().includes(searchValue.toLowerCase()),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal h-10"
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {value || "Chọn hoặc nhập..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Tìm hoặc nhập..."
            value={searchValue}
            onValueChange={setSearchValue}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchValue.trim()) {
                e.preventDefault();
                handleSelect(searchValue.trim());
              }
            }}
          />
          <CommandList>
            {searchValue && filteredSuggestions.length === 0 && (
              <CommandEmpty>
                <button
                  type="button"
                  className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded"
                  onClick={() => handleSelect(searchValue)}
                >
                  Dùng: "{searchValue}"
                </button>
              </CommandEmpty>
            )}
            {searchValue &&
              !filteredSuggestions.includes(searchValue) &&
              filteredSuggestions.length > 0 && (
                <CommandGroup heading="Tùy chỉnh">
                  <CommandItem
                    value={`custom-${searchValue}`}
                    onSelect={() => handleSelect(searchValue)}
                  >
                    <Check className="mr-2 h-4 w-4 opacity-0" />
                    Dùng: "{searchValue}"
                  </CommandItem>
                </CommandGroup>
              )}
            <CommandGroup heading="Gợi ý">
              {(searchValue ? filteredSuggestions : SUGGESTED_SPEC_KEYS).map((key) => (
                <CommandItem key={key} value={key} onSelect={() => handleSelect(key)}>
                  <Check
                    className={cn("mr-2 h-4 w-4", value === key ? "opacity-100" : "opacity-0")}
                  />
                  {key}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface ProductSpecificationsTabProps {
  control: Control<any>;
  setValue: any;
  getValues: any;
}

export function ProductSpecificationsTab({
  control,
  setValue,
  getValues,
}: ProductSpecificationsTabProps) {
  // Watch the specifications field from the form
  const specificationsFromForm = useWatch({ control, name: "specifications" });

  // Local state for the key-value list
  const [entries, setEntries] = useState<SpecificationEntry[]>([{ key: "", value: "" }]);

  // Track if we've initialized from form data
  const hasInitialized = useRef(false);

  // Sync from form to local state ONLY ONCE on initial load
  useEffect(() => {
    if (
      !hasInitialized.current &&
      specificationsFromForm &&
      Array.isArray(specificationsFromForm)
    ) {
      if (specificationsFromForm.length > 0) {
        // Sort by order and map to local format
        const sortedSpecs = [...specificationsFromForm].sort((a, b) => a.order - b.order);
        const entriesFromArray = sortedSpecs.map((spec) => ({
          key: spec.key,
          value: spec.value,
        }));
        setEntries(entriesFromArray);
        hasInitialized.current = true;
      }
    }
  }, [specificationsFromForm]);

  // Sync from local state to form (as array with order)
  const syncToForm = (newEntries: SpecificationEntry[]) => {
    const specsArray = newEntries
      .filter((entry) => entry.key.trim())
      .map((entry, index) => ({
        key: entry.key.trim(),
        value: entry.value,
        order: index,
      }));
    setValue("specifications", specsArray, { shouldDirty: true });
  };

  const handleAddRow = () => {
    const newEntries = [...entries, { key: "", value: "" }];
    setEntries(newEntries);
  };

  const handleRemoveRow = (index: number) => {
    const newEntries = entries.filter((_, i) => i !== index);
    setEntries(newEntries.length > 0 ? newEntries : [{ key: "", value: "" }]);
    syncToForm(newEntries.length > 0 ? newEntries : []);
  };

  const handleKeyChange = (index: number, newKey: string) => {
    const newEntries = [...entries];
    newEntries[index].key = newKey;
    setEntries(newEntries);
    syncToForm(newEntries);
  };

  const handleValueChange = (index: number, newValue: string) => {
    const newEntries = [...entries];
    newEntries[index].value = newValue;
    setEntries(newEntries);
    syncToForm(newEntries);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <Label className="text-base font-medium">Thông số sản phẩm</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Click để chọn từ gợi ý hoặc nhập tên thông số tùy chỉnh
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleAddRow}>
          <Plus className="h-4 w-4 mr-1" />
          Thêm thông số
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[240px]">Tên thông số</TableHead>
            <TableHead>Giá trị</TableHead>
            <TableHead className="w-[80px] text-center">Xóa</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry, index) => (
            <TableRow key={index}>
              <TableCell>
                <SpecKeyCombobox
                  value={entry.key}
                  onChange={(val) => handleKeyChange(index, val)}
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder="Giá trị thông số"
                  value={entry.value}
                  onChange={(e) => handleValueChange(index, e.target.value)}
                />
              </TableCell>
              <TableCell className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveRow(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {entries.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Chưa có thông số nào. Nhấn "Thêm thông số" để bắt đầu.
        </p>
      )}
    </div>
  );
}
