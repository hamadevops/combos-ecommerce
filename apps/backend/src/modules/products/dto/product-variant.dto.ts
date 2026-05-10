import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductVariantDto {
  @ApiPropertyOptional({ example: 'VAR-RED-M' })
  @IsString()
  sku?: string;

  @ApiProperty({ example: 199000 })
  @IsNumber()
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({ example: 159000 })
  @IsNumber()
  @Type(() => Number)
  sale_price?: number;

  @ApiPropertyOptional({ example: 120000 })
  @IsNumber()
  @Type(() => Number)
  cost_price?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @Type(() => Number)
  stock?: number;


}
