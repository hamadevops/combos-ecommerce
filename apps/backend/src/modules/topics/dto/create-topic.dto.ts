import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreateTopicDto {
  @ApiProperty({ example: 'Technology', description: 'Topic name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'All about technology',
    description: 'Topic description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 1, description: 'Parent topic ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  parent_id?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Is topic active',
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
    example: 'Technology News',
    description: 'SEO meta title',
  })
  @IsOptional()
  @IsString()
  meta_title?: string;

  @ApiPropertyOptional({
    example: 'Latest technology news...',
    description: 'SEO meta description',
  })
  @IsOptional()
  @IsString()
  meta_description?: string;

  @ApiPropertyOptional({
    example: 'technology, tech, news',
    description: 'SEO meta keywords',
  })
  @IsOptional()
  @IsString()
  meta_keywords?: string;
}
