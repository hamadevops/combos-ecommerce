import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/common/ImageUpload";
import { Control, Controller } from "react-hook-form";

interface ProductSeoTabProps {
  control: Control<any>;
}

export function ProductSeoTab({ control }: ProductSeoTabProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="seoTitle">SEO Title</Label>
        <Controller
          name="seoTitle"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="seoTitle"
              placeholder="Tiêu đề hiển thị trên Google (nếu trống sẽ dùng tên sản phẩm)"
              value={field.value || ""}
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="seoDescription">SEO Description</Label>
        <Controller
          name="seoDescription"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              id="seoDescription"
              placeholder="Mô tả ngắn gọn hiển thị trên kết quả tìm kiếm..."
              rows={4}
              value={field.value || ""}
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="seoKeywords">SEO Keywords</Label>
        <Controller
          name="seoKeywords"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="seoKeywords"
              placeholder="Từ khóa, cách nhau bằng dấu phẩy"
              value={field.value || ""}
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="canonicalUrl">Canonical URL</Label>
        <Controller
          name="canonicalUrl"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="canonicalUrl"
              placeholder="URL gốc nếu bài viết này là copy"
              value={field.value || ""}
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ogImage">OG Image (Social Share Image)</Label>
        <Controller
          name="ogImage"
          control={control}
          render={({ field }) => (
            <ImageUpload
              value={field.value}
              onChange={field.onChange}
              multiple={false}
              maxFiles={1}
            />
          )}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Ảnh hiển thị khi chia sẻ Link này lên mạng xã hội.
        </p>
      </div>
    </div>
  );
}
