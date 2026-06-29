import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsNumber,
  ValidateNested,
  Min,
} from 'class-validator';

/**
 * DTO cho việc update một variant trong bulk update
 */
export class VariantUpdateDto {
  @ApiProperty({ example: 1, description: 'ID của variant cần update' })
  @IsNumber()
  @Type(() => Number)
  id: number;

  @ApiPropertyOptional({ example: 99000, description: 'Giá mới' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({ example: 79000, description: 'Giá khuyến mãi mới' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  salePrice?: number;

  @ApiPropertyOptional({ example: 50000, description: 'Giá vốn mới' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  costPrice?: number;

  @ApiPropertyOptional({ example: 100, description: 'Tồn kho mới' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  stock?: number;

  @ApiPropertyOptional({ example: 'SKU-NEW-123', description: 'SKU mới' })
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional({ example: 1, description: 'Trạng thái hoạt động (0/1)' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  isActive?: number;
}

/**
 * DTO để bulk update nhiều variants cùng lúc
 */
export class BulkUpdateVariantsDto {
  @ApiProperty({
    type: [VariantUpdateDto],
    description: 'Danh sách variants cần update',
    example: [
      { id: 1, price: 99000, stock: 50 },
      { id: 2, price: 109000, salePrice: 89000, stock: 30 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantUpdateDto)
  variants: VariantUpdateDto[];
}

/**
 * DTO để apply giá/tồn kho đồng nhất cho tất cả variants
 */
export class ApplyToAllVariantsDto {
  @ApiPropertyOptional({ example: 99000, description: 'Giá áp dụng cho tất cả' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({ example: 79000, description: 'Giá KM áp dụng cho tất cả' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  salePrice?: number;

  @ApiPropertyOptional({ example: 100, description: 'Tồn kho áp dụng cho mỗi variant' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  stock?: number;
}
