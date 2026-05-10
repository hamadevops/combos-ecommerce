import { useMemo } from "react";
import { ProductSpecification } from "@/types/product";

/**
 * Custom hook to parse and sort product specifications
 * Handles both JSON string format (from production API) and array format (from local API)
 * Automatically sorts by order field
 */
export function useParseSpecifications(
  specifications: ProductSpecification[] | string | undefined | null,
): ProductSpecification[] {
  return useMemo(() => {
    try {
      let parsed: ProductSpecification[] = [];

      if (typeof specifications === "string") {
        parsed = JSON.parse(specifications) as ProductSpecification[];
      } else if (Array.isArray(specifications)) {
        parsed = specifications;
      }

      // Sort by order to ensure correct display sequence
      return parsed.length > 0 ? [...parsed].sort((a, b) => a.order - b.order) : [];
    } catch (error) {
      console.error("Failed to parse specifications:", error);
    }
    return [];
  }, [specifications]);
}
