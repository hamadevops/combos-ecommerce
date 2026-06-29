import { IsOptional, IsInt, IsBoolean, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class TopicQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Items per page',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    example: 'technology',
    description: 'Search in name and description',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 1, description: 'Filter by parent topic ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  parent_id?: number;

  @ApiPropertyOptional({
    example: 0,
    description: 'Filter by level (0, 1, or 2)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  level?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter by active status',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value;
  })
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Include children topics',
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
  include_children?: boolean = false;

  @ApiPropertyOptional({
    example: true,
    description: 'Include posts',
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
  include_posts?: boolean = false;
}
