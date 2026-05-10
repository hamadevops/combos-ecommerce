import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductImageResponse } from '../responses/product-image.response';
import { ProductVideoResponse } from '../responses/product-video.response';
import { ProductVariantResponse } from '../responses/product-variant.response';
import { CategorySimpleResponse } from '../responses/category-simple.response';

export class ProductResponse {
  @ApiProperty({ example: 1, description: 'Product ID' })
  id: number;

  @ApiProperty({ example: 'Premium T-Shirt', description: 'Product name' })
  name: string;

  @ApiProperty({ example: 'premium-t-shirt', description: 'URL-friendly slug' })
  slug: string;

  @ApiPropertyOptional({
    example: 'SKU-001',
    description: 'Stock keeping unit',
  })
  sku?: string;

  @ApiPropertyOptional({
    example: 'High quality cotton t-shirt',
    description: 'Short description',
  })
  shortDescription?: string;

  @ApiPropertyOptional({
    example: 'Detailed product description with features and specifications',
    description: 'Full description',
  })
  description?: string;

  // SEO Fields
  @ApiPropertyOptional({
    example: 'Buy Premium T-Shirt Online',
    description: 'SEO title',
  })
  seoTitle?: string;

  @ApiPropertyOptional({
    example: 'Shop the best premium t-shirts online',
    description: 'SEO description',
  })
  seoDescription?: string;

  @ApiPropertyOptional({
    example: 't-shirt, premium, cotton',
    description: 'SEO keywords',
  })
  seoKeywords?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/products/premium-t-shirt',
    description: 'Canonical URL',
  })
  canonicalUrl?: string;

  @ApiPropertyOptional({
    example: 'https://storage.example.com/og-image.jpg',
    description: 'Open Graph image',
  })
  ogImage?: string;

  // Pricing
  @ApiProperty({ example: 99.99, description: 'Product price' })
  price: number;

  @ApiPropertyOptional({ example: 79.99, description: 'Sale price' })
  salePrice?: number;

  @ApiPropertyOptional({ example: 50.0, description: 'Cost price' })
  costPrice?: number;

  // Inventory
  @ApiProperty({ example: 100, description: 'Stock quantity' })
  stock: number;

  @ApiProperty({
    example: 1,
    description: 'Active status (1=active, 0=inactive)',
  })
  isActive: number;

  @ApiProperty({
    example: 1,
    description: 'Featured status (1=featured, 0=not featured)',
  })
  isFeatured: number;

  @ApiProperty({
    example: 1,
    description: 'Recommended status (1=recommended, 0=not recommended)',
  })
  isRecommended: number;

  @ApiPropertyOptional({
    example: '2025-12-26T00:00:00.000Z',
    description: 'Publication timestamp',
  })
  publishedAt?: Date;

  @ApiProperty({
    example: '2025-12-26T00:00:00.000Z',
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-12-26T00:00:00.000Z',
    description: 'Last update timestamp',
  })
  updatedAt: Date;

  // Relations
  @ApiProperty({
    type: [ProductImageResponse],
    description: 'Product images',
  })
  images: ProductImageResponse[];

  @ApiProperty({
    type: [ProductVideoResponse],
    description: 'Product videos',
  })
  videos: ProductVideoResponse[];

  @ApiProperty({
    type: [ProductVariantResponse],
    description: 'Product variants',
  })
  variants: ProductVariantResponse[];

  @ApiProperty({
    type: [CategorySimpleResponse],
    description: 'Product categories',
  })
  categories: CategorySimpleResponse[];
}
