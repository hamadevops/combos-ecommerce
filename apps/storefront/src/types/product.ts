// Re-export generated types to maintain compatibility
import {
  ProductResponse,
  ProductListResponseDto,
  ProductSingleResponseDto,
  CreateProductDto as GenCreateProductDto,
  UpdateProductDto as GenUpdateProductDto,
  ProductImageResponse,
  ProductVariantResponse,
  SetTierVariationsDto as GenSetTierVariationsDto,
  TierVariationDto,
  TierOptionDto,
} from "@/generated/api";

// Map generated types to existing application types
// Map generated types to existing application types
export type ProductImage = ProductImageResponse;

// Extend generated types with runtime properties missing in spec
export type ProductVariant = ProductVariantResponse & {
  attributes?: any[];
  sku?: string;
  salePrice?: number | null;
  costPrice?: number | null;
  isActive?: number | boolean;
  optionValues?: string[];
};

// Extend generated ProductResponse to include rating and reviewCount
export type Product = Omit<ProductResponse, "variants"> & {
  variants: ProductVariant[];
  rating?: number;
  reviewCount?: number;
  specifications?: ProductSpecification[];
  tierVariations?: any[];
  product_type?: string;
  productType?: string;
  affiliate_link?: string | null;
  affiliateLink?: string | null;
};

// Product specification with order for maintaining sequence
export interface ProductSpecification {
  key: string;
  value: string;
  order: number;
}

// Request DTOs - extended with specifications
export type CreateProductDto = GenCreateProductDto & {
  specifications?: ProductSpecification[];
};
export type UpdateProductDto = GenUpdateProductDto & {
  specifications?: ProductSpecification[];
};
export type SetTierVariationsDto = GenSetTierVariationsDto;
export type TierVariation = TierVariationDto;
export type TierVariationOption = TierOptionDto;

// Response types
export type ProductListResponse = ProductListResponseDto;
export type ProductSingleResponse = ProductSingleResponseDto;

// Retain interfaces that might not be in generated types or helper types
// if they are strictly frontend helper types.
// For now, we aliased everything.

// Note: Some properties might be missing in generated types compared to manual types
// (e.g. ProductImage.productId). If verified they exist in API,
// we should extend the types or update the spec.
// For now, we use the generated types source of truth.
