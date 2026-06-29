import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Control, Controller } from "react-hook-form";

interface BlogSeoTabProps {
  control: Control<any>;
}

export function BlogSeoTab({ control }: BlogSeoTabProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="metaTitle">Meta Title</Label>
        <Controller
          name="metaTitle"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="metaTitle"
              placeholder="Tiêu đề hiển thị trên Google"
              value={field.value || ""}
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="metaDescription">Meta Description</Label>
        <Controller
          name="metaDescription"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              id="metaDescription"
              placeholder="Mô tả hiển thị trên kết quả tìm kiếm..."
              rows={4}
              value={field.value || ""}
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="metaKeywords">Meta Keywords</Label>
        <Controller
          name="metaKeywords"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="metaKeywords"
              placeholder="Từ khóa, cách nhau bằng dấu phẩy"
              value={field.value || ""}
            />
          )}
        />
      </div>
    </div>
  );
}
