import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Plus, X } from "lucide-react";
import { Control, useFieldArray, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { useSetTierVariations } from "@/hooks/useProducts";
import { TierVariation } from "@/types/product";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductVariantsTabProps {
  productId: number;
  control: Control<any>;
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  getValues: any;
}

export function ProductVariantsTab({
  productId,
  control,
  register,
  setValue,
  getValues,
}: ProductVariantsTabProps) {
  // Tier Builder State
  const [tiers, setTiers] = useState<TierVariation[]>([]);
  const [tempOptionInput, setTempOptionInput] = useState<{ [key: number]: string }>({});

  // API Hook
  const setTierVariationsMutation = useSetTierVariations(productId);

  // Form Field Array for editing generated variants
  const { fields, remove } = useFieldArray({
    control,
    name: "variants",
  });

  // Populate Tiers from existing data (if available)
  // We assume getValues('options') or similar might hold it, OR we deduce from variants?
  // TikTok Shop style usually saves the "options" structure.
  // If not saved, we can't easily reconstruct 100% accurately without "options" field in API.
  // Checking ProductResponse interface... it has 'variants'.
  // Use 'options' from product if available (Update product.ts if needed), or deduce.
  // For now, let's try to deduce from variants if tiers is empty.

  // Actually, passing `tiers` as a prop or fetching it would be better.
  // But since we don't have it in `ProductResponse` yet (based on previous view), we might be stuck.
  // WAIT! The previous step 608 showed `Product` interface.
  // It did NOT see `options` or `tier_variations`.
  // However, the `productApi.setTierVariations` sends it.
  // Does the backend return it?
  // If not, we have a problem: we can't show the "Setup" for existing products unless we deduce it.

  // Let's implement a Deduction Strategy for now.
  // 1. Group variants by attribute value combinations.
  // 2. Extract Attribute Names (e.g. "Color") and Values (e.g. "Red").

  useEffect(() => {
    const currentVariants = getValues("variants");
    if (tiers.length === 0 && currentVariants && currentVariants.length > 0) {
      // Attempt to deduce tiers from the first variant's attributes
      // Note: This relies on all variants having the same attribute structure (which they should).
      const sampleVariant = currentVariants[0];
      if (sampleVariant.attributes && sampleVariant.attributes.length > 0) {
        const deducedTiers: TierVariation[] = [];

        // Map store of all values for each attribute name
        const attributeMap = new Map<string, Set<string>>();

        currentVariants.forEach((v: any) => {
          v.attributes?.forEach((a: any) => {
            const name = a.attribute?.name || a.name || "Unknown"; // Adjust based on actual data
            const value = a.value || a.attribute?.value || "Unknown";

            if (!attributeMap.has(name)) {
              attributeMap.set(name, new Set());
            }
            attributeMap.get(name)?.add(value);
          });
        });

        attributeMap.forEach((values, name) => {
          deducedTiers.push({
            name: name,
            options: Array.from(values).map((v) => ({ value: v })),
          });
        });

        // Only set if we found something
        if (deducedTiers.length > 0) {
          setTiers(deducedTiers);
        }
      }
    }
  }, [fields.length]); // Run when fields loaded
  // Note: getValues('variants') might be empty initially. fields is better?
  // 'fields' is from useFieldArray.

  // Better: use a separate useEffect dependent on the prop or initial load?
  // But `variants` are passed into form methods.

  // Let's refine the dependency.
  useEffect(() => {
    const variants = getValues("variants");
    if (variants?.length > 0 && tiers.length === 0) {
      const attrMap = new Map<string, Set<string>>();

      variants.forEach((v: any) => {
        // The attribute structure in form might be:
        // { attribute_value_id, value: "Red", attribute: { name: "Color" } }
        // We need to inspect exactly what `AdminProductForm` loads into `variants`.
        v.attributes?.forEach((a: any) => {
          // Check structure options
          const attrName = a.attribute?.name || a.name;
          const attrValue = a.value || a.attribute?.value;

          if (attrName && attrValue) {
            if (!attrMap.has(attrName)) {
              attrMap.set(attrName, new Set());
            }
            attrMap.get(attrName)?.add(attrValue);
          }
        });
      });

      const newTiers: TierVariation[] = [];
      attrMap.forEach((values, name) => {
        newTiers.push({
          name: name,
          options: Array.from(values).map((val) => ({ value: val })),
        });
      });

      if (newTiers.length > 0) {
        setTiers(newTiers);
      }
    }
  }, [fields]); // React to fields change (initial load)

  // --- Tier Management Functions ---

  const addTier = () => {
    if (tiers.length >= 2) return; // Limit to 2 tiers for simplicity like Shopee/TikTok often do initially
    setTiers([...tiers, { name: "", options: [] }]);
  };

  const removeTier = (index: number) => {
    const newTiers = [...tiers];
    newTiers.splice(index, 1);
    setTiers(newTiers);
  };

  const updateTierName = (index: number, name: string) => {
    const newTiers = [...tiers];
    newTiers[index].name = name;
    setTiers(newTiers);
  };

  const addOptionToTier = (tierIndex: number) => {
    const val = tempOptionInput[tierIndex]?.trim();
    if (!val) return;

    const newTiers = [...tiers];
    // Check duplicate
    if (newTiers[tierIndex].options.some((o) => o.value === val)) return;

    newTiers[tierIndex].options.push({ value: val });
    setTiers(newTiers);
    setTempOptionInput({ ...tempOptionInput, [tierIndex]: "" });
  };

  const removeOptionFromTier = (tierIndex: number, optionIndex: number) => {
    const newTiers = [...tiers];
    newTiers[tierIndex].options.splice(optionIndex, 1);
    setTiers(newTiers);
  };

  const handleGenerate = () => {
    // Validate
    if (tiers.length === 0) return;
    const invalidTier = tiers.find((t) => !t.name || t.options.length === 0);
    if (invalidTier) {
      alert("Vui lòng nhập tên nhóm phân loại và ít nhất 1 tùy chọn.");
      return;
    }

    setTierVariationsMutation.mutate({
      tierVariations: tiers,
      autoGenerateVariants: true,
    });
  };

  return (
    <div className="space-y-8">
      {/* Tier Builder Section */}
      <div className="bg-muted/30 p-4 rounded-lg border border-border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">1. Thiết lập Phân loại hàng</h3>
          {tiers.length < 2 && (
            <Button type="button" variant="outline" size="sm" onClick={addTier}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm nhóm phân loại
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {tiers.map((tier, tierIndex) => (
            <div key={tierIndex} className="bg-background p-4 rounded-md border shadow-sm relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={() => removeTier(tierIndex)}
              >
                <X className="w-4 h-4" />
              </Button>

              <div className="grid gap-4">
                <div>
                  <Label className="mb-2 block">Tên nhóm (Ví dụ: Màu sắc, Kích thước)</Label>
                  <Input
                    value={tier.name}
                    onChange={(e) => updateTierName(tierIndex, e.target.value)}
                    placeholder="Nhập tên nhóm phân loại..."
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Tùy chọn (Nhấn Enter để thêm)</Label>
                  <div className="flex flex-wrap gap-2 mb-2 p-2 min-h-[40px] border rounded bg-muted/10">
                    {tier.options.map((opt, optIndex) => (
                      <Badge key={optIndex} variant="secondary" className="pl-2 pr-1 h-7">
                        {opt.value}
                        <button
                          type="button"
                          onClick={() => removeOptionFromTier(tierIndex, optIndex)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                    <input
                      type="text"
                      className="bg-transparent outline-none flex-1 min-w-[120px] text-sm"
                      placeholder="Nhập tùy chọn..."
                      value={tempOptionInput[tierIndex] || ""}
                      onChange={(e) =>
                        setTempOptionInput({ ...tempOptionInput, [tierIndex]: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addOptionToTier(tierIndex);
                        }
                      }}
                      onBlur={() => addOptionToTier(tierIndex)} // Also add on blur
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {tiers.length === 0 && (
            <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
              Chưa có nhóm phân loại nào. Nhấn "Thêm nhóm phân loại" để bắt đầu.
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={tiers.length === 0 || setTierVariationsMutation.isPending}
          >
            {setTierVariationsMutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Tạo biến thể ngay (Lưu & Generate)
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-right">
          * Lưu ý: Hành động này sẽ lưu và ghi đè các biến thể hiện tại.
        </p>
      </div>

      {/* Variants List Section */}
      <div>
        <h3 className="font-semibold text-lg mb-4">2. Danh sách biến thể ({fields.length})</h3>

        {fields.length > 0 ? (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Tên biến thể</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Giá bán</TableHead>
                  <TableHead>Giá KM</TableHead>
                  <TableHead>Tồn kho</TableHead>
                  <TableHead className="text-center w-[100px]">Trạng thái</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field: any, index) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <div className="font-medium">{field.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {field.attributes
                          ?.map((a: any) => a.value || a.attribute?.value)
                          .join(" / ")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input {...register(`variants.${index}.sku`)} className="h-8 w-full" />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        {...register(`variants.${index}.price`)}
                        className="h-8 w-[100px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        {...register(`variants.${index}.salePrice`)}
                        className="h-8 w-[100px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        {...register(`variants.${index}.stock`)}
                        className="h-8 w-[80px]"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={field.isActive}
                        onCheckedChange={(checked) =>
                          setValue(`variants.${index}.isActive`, checked)
                        }
                        defaultChecked={field.isActive}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground border rounded-lg bg-muted/10">
            Chưa có biến thể nào. Vui lòng thiết lập phân loại hàng và nhấn "Tạo biến thể".
          </div>
        )}
      </div>
    </div>
  );
}
