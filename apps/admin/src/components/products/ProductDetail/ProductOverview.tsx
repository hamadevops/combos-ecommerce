import { HtmlContent } from "@/components/common/HtmlContent";
import { Product } from "@/types/product";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

interface ProductOverviewProps {
  product: Product;
}

export default function ProductOverview({ product }: ProductOverviewProps) {
  const shortDescription = product.shortDescription;
  const specifications = product.specifications;

  // Sort specifications by order if available
  const sortedSpecs =
    specifications && specifications.length > 0
      ? [...specifications].sort((a, b) => a.order - b.order)
      : [];

  const hasContent = shortDescription || sortedSpecs.length > 0;

  return (
    <div id="overview" className="scroll-mt-[100px] bg-background">
      <div className="px-4 py-3 space-y-4">
        {/* Short Description */}
        {shortDescription && <HtmlContent content={shortDescription} />}

        {/* Specifications Table */}
        {sortedSpecs.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Thông số kỹ thuật</h4>
            <Table>
              <TableBody>
                {sortedSpecs.map((spec, index) => (
                  <TableRow
                    key={`${spec.key}-${spec.order}`}
                    className={index % 2 === 0 ? "bg-muted/50" : ""}
                  >
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

        {/* Fallback when no content */}
        {!hasContent && <p className="text-muted-foreground text-sm">Đang cập nhật...</p>}
      </div>
    </div>
  );
}
