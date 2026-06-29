import { IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Electronics', description: 'Category name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'All electronic devices',
    description: 'Category description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 1, description: 'Parent category ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  parent_id?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Is category active',
    default: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value;
  })
  @IsBoolean()
  is_active?: boolean = true;

  @ApiPropertyOptional({ example: 0, description: 'Sort order', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sort_order?: number = 0;

  // SEO fields
  @ApiPropertyOptional({
    example: 'Buy Electronics Online',
    description: 'SEO meta title',
  })
  @IsOptional()
  @IsString()
  meta_title?: string;

  @ApiPropertyOptional({
    example: 'Shop the best electronics...',
    description: 'SEO meta description',
  })
  @IsOptional()
  @IsString()
  meta_description?: string;

  @ApiPropertyOptional({
    example: 'electronics, gadgets, devices',
    description: 'SEO meta keywords',
  })
  @IsOptional()
  @IsString()
  meta_keywords?: string;

  // Image upload
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Category image file',
  })
  @IsOptional()
  image?: Express.Multer.File;
}
