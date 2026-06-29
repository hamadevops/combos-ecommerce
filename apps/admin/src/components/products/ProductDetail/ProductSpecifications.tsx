import { Product, ProductSpecification } from "@/types/product";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

interface ProductSpecificationsProps {
  product: Product;
}

export default function ProductSpecifications({ product }: ProductSpecificationsProps) {
  const specifications = product.specifications;

  if (!specifications || specifications.length === 0) {
    return null;
  }

  // Sort by order to ensure correct display sequence
  const sortedSpecs = [...specifications].sort((a, b) => a.order - b.order);

  return (
    <div
      id="specifications"
      className="bg-background p-4 space-y-3 border-t border-border scroll-mt-[100px]"
    >
      <h3 className="font-bold text-lg">Thông số kỹ thuật</h3>
      <Table>
        <TableBody>
          {sortedSpecs.map((spec, index) => (
            <TableRow
              key={`${spec.key}-${spec.order}`}
              className={index % 2 === 0 ? "bg-muted/50" : ""}
            >
              <TableCell className="font-medium text-muted-foreground w-[140px] py-2.5">
                {spec.key}
              </TableCell>
              <TableCell className="py-2.5">{spec.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
