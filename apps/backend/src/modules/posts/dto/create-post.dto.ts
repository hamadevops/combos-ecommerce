import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreatePostDto {
  @ApiProperty({
    example: 'Getting Started with NestJS',
    description: 'Post title',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example: 'A brief introduction to NestJS framework',
    description: 'Short description/excerpt',
  })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiPropertyOptional({
    example: 'Full article content here...',
    description: 'Long content',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: [1, 2], description: 'Array of topic IDs' })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.map((id) => Number(id));
        }
        return [Number(parsed)];
      } catch {
        return value.split(',').map((id) => Number(id.trim()));
      }
    }
    if (Array.isArray(value)) {
      return value.map((id) => Number(id));
    }
    return value;
  })
  topic_ids?: number[];

  @ApiPropertyOptional({ example: [1, 2, 3], description: 'Array of tag IDs' })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.map((id) => Number(id));
        }
        return [Number(parsed)];
      } catch {
        return value.split(',').map((id) => Number(id.trim()));
      }
    }
    if (Array.isArray(value)) {
      return value.map((id) => Number(id));
    }
    return value;
  })
  tag_ids?: number[];

  @ApiPropertyOptional({
    example: true,
    description: 'Is post active',
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
  is_active?: boolean = false;

  @ApiPropertyOptional({
    example: true,
    description: 'Is post published',
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
  is_published?: boolean = false;

  @ApiPropertyOptional({
    example: '2025-12-31T00:00:00Z',
    description: 'Schedule publication date',
  })
  @IsOptional()
  @IsDateString()
  published_at?: string;

  // SEO fields
  @ApiPropertyOptional({
    example: 'NestJS Tutorial',
    description: 'SEO meta title',
  })
  @IsOptional()
  @IsString()
  meta_title?: string;

  @ApiPropertyOptional({
    example: 'Learn NestJS...',
    description: 'SEO meta description',
  })
  @IsOptional()
  @IsString()
  meta_description?: string;

  @ApiPropertyOptional({
    example: 'nestjs, tutorial, nodejs',
    description: 'SEO meta keywords',
  })
  @IsOptional()
  @IsString()
  meta_keywords?: string;

  // Thumbnail upload
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Post thumbnail image',
  })
  @IsOptional()
  thumbnail?: Express.Multer.File;
}
