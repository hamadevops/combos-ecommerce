import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsBoolean,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

import { ProductSeoDto } from './product-seo.dto';
import { CreateProductVariantDto } from './product-variant.dto';
import { ProductSpecificationItemDto } from './product-specification.dto';

export class CreateProductDto {
  // FILES
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Only jpg, jpeg, png, webp are allowed',
    nullable: true,
  })
  @IsOptional()
  files?: Express.Multer.File[];

  // BASIC INFO
  @ApiProperty({ example: 'Áo thun nam' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'ao-thun-nam' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  short_description?: string;

  @ApiPropertyOptional()
  @ApiPropertyOptional()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'SKU-001' })
  @IsOptional()
  @IsString()
  sku?: string;

  // SEO
  @ApiPropertyOptional({ type: ProductSeoDto })
  @IsOptional()
  @Type(() => ProductSeoDto)
  seo?: ProductSeoDto;

  // PRICING & INVENTORY
  @ApiProperty({ example: 99.99, description: 'Product price' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 79.99, description: 'Sale price (optional)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sale_price?: number;

  @ApiPropertyOptional({ example: 50.0, description: 'Cost price (optional)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cost_price?: number;

  @ApiProperty({ example: 100, description: 'Stock quantity', default: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock: number = 0;

  @ApiPropertyOptional({
    example: true,
    description: 'Is featured product',
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value;
  })
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Alias for isFeatured (deprecated)' })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value;
  })
  @IsBoolean()
  is_featured?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Is recommended product',
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value;
  })
  @IsBoolean()
  isRecommended?: boolean;

  @ApiPropertyOptional({ description: 'Alias for isRecommended (deprecated)' })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value;
  })
  @IsBoolean()
  is_recommended?: boolean;

  @ApiPropertyOptional({ description: 'Trạng thái hoạt động', example: 1 })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return 1;
    if (value === 'false' || value === false) return 0;
    return Number(value);
  })
  @IsNumber()
  isActive?: number;

  @ApiPropertyOptional({ description: 'Alias for isActive' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return 1;
    if (value === 'false' || value === false) return 0;
    return Number(value);
  })
  @IsNumber()
  active?: number;

  // VARIANTS
  @ApiPropertyOptional({ type: [CreateProductVariantDto] })
  @IsOptional()
  @Type(() => CreateProductVariantDto)
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  variants?: CreateProductVariantDto[];

  // CATEGORIES
  @ApiPropertyOptional({
    type: [Number],
    description: 'Array of category IDs',
    example: [1, 2],
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  category_ids?: number[];

  // SPECIFICATIONS
  @ApiPropertyOptional({
    type: [ProductSpecificationItemDto],
    description: 'Product specifications array with key, value, and order',
    example: [
      { key: 'Model', value: 'ABC-123', order: 0 },
      { key: 'Công suất', value: '1000W', order: 1 },
      { key: 'Bảo hành', value: '12 tháng', order: 2 },
    ],
  })
  @IsOptional()
  @IsArray({ message: 'Specifications phải là một mảng' })
  @ValidateNested({ each: true })
  @Type(() => ProductSpecificationItemDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  specifications?: ProductSpecificationItemDto[];

  // DISPLAY ORDER
  @ApiPropertyOptional({
    description: 'Thứ tự hiển thị sản phẩm',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  display_order?: number;
}

