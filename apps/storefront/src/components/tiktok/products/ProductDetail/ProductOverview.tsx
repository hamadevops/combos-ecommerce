import { useMemo } from "react";
import { HtmlContent } from "@/components/tiktok/common/HtmlContent";
import { Product } from "@/types/product";
import { Table, TableBody, TableCell, TableRow } from "@/components/tiktok/ui/table";
import { useParseSpecifications } from "@/hooks/useParseSpecifications";

interface ProductOverviewProps {
  product: Product;
}

export default function ProductOverview({ product }: ProductOverviewProps) {
  const shortDescription = product.shortDescription;

  // Parse specifications using custom hook
  const specifications = useParseSpecifications(product.specifications);

  // Sort specifications by order if available
  const sortedSpecs =
    specifications && specifications.length > 0
      ? [...specifications].sort((a, b) => a.order - b.order)
      : [];

  const hasContent = shortDescription || sortedSpecs.length > 0;

  if (!hasContent) return null;

  return (
    <div className="bg-background">
      <div className="px-4 py-3 space-y-4">
        {/* Short Description */}
        {shortDescription && <HtmlContent content={shortDescription} />}

        {/* Specifications Table */}
        {specifications.length > 0 && (
          <div className="space-y-2">
            <h2 className="font-semibold text-sm">Thông số kỹ thuật</h2>
            <Table>
              <TableBody>
                {specifications.map((spec, index) => (
                  <TableRow key={`spec-${index}`} className={index % 2 === 0 ? "bg-muted/50" : ""}>
                    <TableCell className="font-medium text-muted-foreground w-[120px] py-2 text-xs">
                      {spec.key}
                    </TableCell>
                    <TableCell className="py-2 text-xs">{spec.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
