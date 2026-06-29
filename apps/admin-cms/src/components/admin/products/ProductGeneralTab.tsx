import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Control, Controller, useWatch } from "react-hook-form";
import { MultiSelect } from "@/components/ui/multi-select";
import { Category } from "@/types/category";

import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { generateSlug } from "@/lib/utils";

interface ProductGeneralTabProps {
  control: Control<any>;
  categories: Category[];
  setValue: any;
  getValues: any;
  isEditing?: boolean;
}

export function ProductGeneralTab({
  control,
  categories,
  setValue,
  getValues,
  isEditing = true,
}: ProductGeneralTabProps) {
  const handleGenerateSlug = () => {
    const name = getValues("name");
    if (name) {
      setValue("slug", generateSlug(name), { shouldDirty: true });
    }
  };

  const generateSku = () => {
    const name = getValues("name");
    if (name) {
      // Simple SKU generation: Uppercase, remove special chars, take first 3 chars + random 4 digits?
      // Or just slugify and uppercase?
      // User request usually implies a simple transform. Let's do a clean uppercase slug-like string.
      // Simple SKU generation using generateSlug
      const sku = generateSlug(name).toUpperCase().replace(/-/g, "").slice(0, 10);
      setValue("sku", sku, { shouldDirty: true });
    }
  };
  return (
    <div className="space-y-6">
      {/* 1. Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Tên sản phẩm <span className="text-red-500">*</span>
        </Label>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <>
              <Input
                {...field}
                id="name"
                placeholder="Nhập tên sản phẩm"
                className={error?.message ? "border-red-500" : ""}
              />
              {error?.message && <p className="text-xs text-red-500">{String(error.message)}</p>}
            </>
          )}
        />
      </div>

      {/* 2 & 3. Slug & SKU */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="slug">Slug (URL)</Label>
          <Controller
            name="slug"
            control={control}
            render={({ field }) => (
              <div className="flex gap-2">
                <Input {...field} id="slug" placeholder="ten-san-pham" />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleGenerateSlug}
                  title="Auto Gen Slug"
                >
                  <Wand2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sku">SKU (Mã kho)</Label>
          <Controller
            name="sku"
            control={control}
            render={({ field }) => (
              <div className="flex gap-2">
                <Input {...field} id="sku" placeholder="Mã sản phẩm" value={field.value || ""} />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={generateSku}
                  title="Auto Gen SKU"
                >
                  <Wand2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          />
        </div>
      </div>

      {/* 4. Category, Active, Featured Row */}
      <div className="grid grid-cols-12 gap-4 items-end">
        <div className="col-span-12 md:col-span-6 space-y-2">
          <Label>Danh mục</Label>
          <Controller
            name="category_ids"
            control={control}
            render={({ field }) => (
              <MultiSelect
                selected={field.value?.map(String) || []}
                options={categories.map((c) => ({ label: c.name, value: String(c.id) }))}
                onChange={(selected) => field.onChange(selected.map(Number))}
                placeholder="Chọn danh mục..."
              />
            )}
          />
        </div>

        {isEditing && (
          <div className="col-span-4 md:col-span-2">
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <div className="flex items-center space-x-2 border p-3 rounded-md h-[44px]">
                  <Switch id="isActive" checked={field.value} onCheckedChange={field.onChange} />
                  <Label htmlFor="isActive" className="cursor-pointer whitespace-nowrap">
                    Hiển thị
                  </Label>
                </div>
              )}
            />
          </div>
        )}

        <div className="col-span-4 md:col-span-2">
          <Controller
            name="isFeatured"
            control={control}
            render={({ field }) => (
              <div className="flex items-center space-x-2 border p-3 rounded-md h-[44px]">
                <Switch id="isFeatured" checked={field.value} onCheckedChange={field.onChange} />
                <Label htmlFor="isFeatured" className="cursor-pointer whitespace-nowrap">
                  Nổi bật
                </Label>
              </div>
            )}
          />
        </div>

        <div className="col-span-4 md:col-span-2">
          <Controller
            name="isRecommended"
            control={control}
            render={({ field }) => (
              <div className="flex items-center space-x-2 border p-3 rounded-md h-[44px]">
                <Switch id="isRecommended" checked={field.value} onCheckedChange={field.onChange} />
                <Label htmlFor="isRecommended" className="cursor-pointer whitespace-nowrap">
                  Đề xuất
                </Label>
              </div>
            )}
          />
        </div>
      </div>

      {/* Product Type (Purchase vs Affiliate) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md bg-muted/20">
        <div className="space-y-2">
          <Label htmlFor="product_type">Loại sản phẩm</Label>
          <Controller
            name="product_type"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                id="product_type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="purchase">Mua hàng trực tiếp (Purchase)</option>
                <option value="affiliate">Tiếp thị liên kết (Affiliate)</option>
              </select>
            )}
          />
        </div>

        {useWatch({ control, name: "product_type" }) === "affiliate" && (
          <div className="space-y-2">
            <Label htmlFor="affiliate_link">
              Đường dẫn Affiliate <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="affiliate_link"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <Input
                    {...field}
                    id="affiliate_link"
                    placeholder="https://example.com/affiliate-url"
                    className={error?.message ? "border-red-500" : ""}
                    value={field.value || ""}
                  />
                  {error?.message && (
                    <p className="text-xs text-red-500">{String(error.message)}</p>
                  )}
                </>
              )}
            />
          </div>
        )}
      </div>

      {/* 7, 8, 9, 10. Prices, Stock & Display Order */}
      <div className="grid grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">
            Giá bán (VNĐ) <span className="text-red-500">*</span>
          </Label>
          <Controller
            name="price"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <>
                <Input
                  {...field}
                  id="price"
                  type="text"
                  placeholder="0"
                  className={error?.message ? "border-red-500" : ""}
                  value={field.value !== undefined && field.value !== null && field.value !== "" ? String(field.value).replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/\D/g, "");
                    field.onChange(rawValue ? Number(rawValue) : "");
                  }}
                />
                {error?.message && <p className="text-xs text-red-500">{String(error.message)}</p>}
              </>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="salePrice">Giá khuyến mãi</Label>
          <Controller
            name="salePrice"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="salePrice"
                type="text"
                placeholder="0"
                value={field.value !== undefined && field.value !== null && field.value !== "" ? String(field.value).replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\D/g, "");
                  field.onChange(rawValue ? Number(rawValue) : "");
                }}
              />
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">Tồn kho</Label>
          <Controller
            name="stock"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="stock"
                type="text"
                placeholder="0"
                value={field.value !== undefined && field.value !== null && field.value !== "" ? String(field.value).replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\D/g, "");
                  field.onChange(rawValue ? parseInt(rawValue, 10) : 0);
                }}
              />
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="displayOrder">Thứ tự hiển thị</Label>
          <Controller
            name="displayOrder"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="displayOrder"
                type="number"
                min={0}
                placeholder="0"
                value={field.value ?? 0}
                onChange={(e) => {
                  field.onChange(e.target.value === "" ? 0 : parseInt(e.target.value, 10));
                }}
              />
            )}
          />
        </div>
      </div>

      {/* 10. Short Description */}
      <div className="space-y-2">
        <Label htmlFor="shortDescription">Tổng quan sản phẩm</Label>
        <Controller
          name="shortDescription"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              id="shortDescription"
              placeholder="Tổng quan sản phẩm"
              className="h-[80px]"
              value={field.value || ""}
            />
          )}
        />
      </div>

      {/* 11. Description */}
      <div className="space-y-2">
        <Label>Mô tả chi tiết</Label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              value={field.value || ""}
              onChange={field.onChange}
              placeholder="Mô tả chi tiết sản phẩm..."
              minHeight={400}
              maxHeight={600}
            />
          )}
        />
      </div>
    </div>
  );
}
