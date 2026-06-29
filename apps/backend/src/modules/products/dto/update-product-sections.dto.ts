import { IsArray, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { CreateProductVariantDto } from './product-variant.dto';
import { ProductSeoDto } from './product-seo.dto';

export class UpdateProductGeneralDto {
  @ApiProperty({ example: 'Áo thun nam' })
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  short_description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  description?: string;

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
  is_featured?: boolean = false;
  
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
}

export class UpdateProductVariantsDto {
  @ApiPropertyOptional({ type: [CreateProductVariantDto] })
  @IsOptional()
  @Type(() => CreateProductVariantDto)
  @IsArray()
  variants?: CreateProductVariantDto[];
}

export class UpdateProductSeoDto {
  @ApiPropertyOptional({ type: ProductSeoDto })
  @IsOptional()
  @Type(() => ProductSeoDto)
  seo?: ProductSeoDto;
}
