import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsArray,
  IsOptional,
  IsNumber,
  IsBoolean,
  ValidateNested,
  MinLength,
  Min,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';

/**
 * DTO cho một option trong tier
 * Ví dụ: { value: "Đỏ", imageUrl: "https://..." }
 */
export class TierOptionDto {
  @ApiProperty({ example: 'Đỏ', description: 'Giá trị của option' })
  @IsString()
  @MinLength(1)
  value: string;

  @ApiPropertyOptional({
    example: 'https://example.com/red-shirt.jpg',
    description: 'URL ảnh đại diện (chỉ tier1 có ảnh)',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

/**
 * DTO cho một tier variation
 * Ví dụ: { name: "Màu sắc", options: [{ value: "Đỏ" }, { value: "Xanh" }] }
 */
export class TierVariationDto {
  @ApiProperty({ example: 'Màu sắc', description: 'Tên của phân loại' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({
    type: [TierOptionDto],
    description: 'Danh sách các option trong phân loại này',
    example: [{ value: 'Đỏ', imageUrl: 'https://...' }, { value: 'Xanh' }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TierOptionDto)
  @ArrayMinSize(1)
  options: TierOptionDto[];
}

/**
 * DTO để thiết lập tier variations cho sản phẩm
 */
export class SetTierVariationsDto {
  @ApiProperty({
    type: [TierVariationDto],
    description: 'Danh sách các tier variations (tối đa 2)',
    example: [
      {
        name: 'Màu sắc',
        options: [
          { value: 'Đỏ', imageUrl: 'https://...' },
          { value: 'Xanh', imageUrl: 'https://...' },
        ],
      },
      {
        name: 'Kích thước',
        options: [{ value: 'S' }, { value: 'M' }, { value: 'L' }],
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TierVariationDto)
  @ArrayMaxSize(2, { message: 'Sản phẩm chỉ được phép có tối đa 2 phân loại hàng' })
  tierVariations: TierVariationDto[];

  @ApiPropertyOptional({
    example: true,
    description: 'Tự động tạo variant matrix sau khi set tiers',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  autoGenerateVariants?: boolean;

  @ApiPropertyOptional({
    example: 99000,
    description: 'Giá mặc định cho các variants được tạo tự động',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  defaultPrice?: number;

  @ApiPropertyOptional({
    example: 100,
    description: 'Tồn kho mặc định cho các variants được tạo tự động',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  defaultStock?: number;
}

/**
 * Response DTO cho tier variation
 */
export class TierOptionResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Đỏ' })
  value: string;

  @ApiPropertyOptional({ example: 'https://example.com/red.jpg' })
  imageUrl?: string;

  @ApiProperty({ example: 0 })
  position: number;

  @ApiProperty({ example: 1 })
  isActive: number;
}

export class TierVariationResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Màu sắc' })
  name: string;

  @ApiProperty({ example: 0, description: '0 = tier1, 1 = tier2' })
  tierIndex: number;

  @ApiProperty({ example: 0 })
  position: number;

  @ApiProperty({ type: [TierOptionResponseDto] })
  options: TierOptionResponseDto[];
}

export class GetTierVariationsResponseDto {
  @ApiProperty({ example: 1 })
  productId: number;

  @ApiProperty({ example: 'iPhone 15 Pro Max' })
  productName: string;

  @ApiProperty({ type: [TierVariationResponseDto] })
  tierVariations: TierVariationResponseDto[];
}
