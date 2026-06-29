import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductVariantDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiPropertyOptional({ example: 'Đỏ - M' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'VAR-RED-M' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({ example: 199000 })
  @IsNumber()
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({ example: 159000 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sale_price?: number;

  @ApiPropertyOptional({ example: 120000 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  cost_price?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  stock?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  isActive?: number;

  @ApiPropertyOptional({ example: ['Đỏ', 'M'] })
  @IsOptional()
  @IsArray()
  optionValues?: string[];
}
