import {
  IsString,
  IsNumber,
  IsNotEmpty,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ProductSpecificationItemDto {
  @ApiProperty({
    example: 'Model',
    description: 'Specification key/label',
  })
  @IsString()
  @IsNotEmpty({ message: 'Key không được để trống' })
  @MaxLength(100, { message: 'Key không được vượt quá 100 ký tự' })
  key: string;

  @ApiProperty({
    example: 'ABC-123',
    description: 'Specification value',
  })
  @IsString()
  @IsNotEmpty({ message: 'Value không được để trống' })
  @MaxLength(500, { message: 'Value không được vượt quá 500 ký tự' })
  value: string;

  @ApiProperty({
    example: 0,
    description: 'Display order (0-based)',
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'Order phải là số' })
  @Min(0, { message: 'Order phải >= 0' })
  order: number;
}
