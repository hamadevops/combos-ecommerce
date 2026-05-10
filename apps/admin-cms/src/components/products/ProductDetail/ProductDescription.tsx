import { HtmlContent } from "@/components/common/HtmlContent";
import { Product } from "@/types/product";

interface ProductDescriptionProps {
  product: Product;
}

export default function ProductDescription({ product }: ProductDescriptionProps) {
  const description = product.description || product.shortDescription;

  return (
    <div
      id="description"
      className="bg-background p-4 space-y-4 border-t border-border scroll-mt-[100px]"
    >
      <h3 className="font-bold text-lg">Mô tả sản phẩm</h3>
      {description ? (
        <HtmlContent content={description} />
      ) : (
        <p className="text-muted-foreground text-sm leading-relaxed">Đang cập nhật mô tả...</p>
      )}
    </div>
  );
}
