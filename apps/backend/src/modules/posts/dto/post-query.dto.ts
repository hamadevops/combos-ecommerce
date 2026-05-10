import {
  IsOptional,
  IsInt,
  IsBoolean,
  IsString,
  IsNumber,
  IsEnum,
  IsDateString,
  IsArray,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

/**
 * Enum cho các tùy chọn sắp xếp bài viết
 */
export enum PostSortByEnum {
  /** Mới nhất (theo ngày tạo) */
  NEWEST = 'newest',
  /** Cũ nhất (theo ngày tạo) */
  OLDEST = 'oldest',
  /** Nhiều lượt xem nhất */
  MOST_VIEWS = 'most_views',
  /** Tiêu đề A-Z */
  TITLE_ASC = 'title_asc',
  /** Tiêu đề Z-A */
  TITLE_DESC = 'title_desc',
  /** Xuất bản gần đây nhất */
  RECENTLY_PUBLISHED = 'recently_published',
}

export class PostQueryDto {
  // ── Phân trang ────────────────────────────────────────────────────────
  @ApiPropertyOptional({ example: 1, description: 'Số trang', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Số bài mỗi trang',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  // ── Tìm kiếm ─────────────────────────────────────────────────────────
  @ApiPropertyOptional({
    example: 'nestjs',
    description: 'Tìm kiếm trong title, excerpt, content',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 'getting-started',
    description: 'Tìm kiếm gần đúng theo slug',
  })
  @IsOptional()
  @IsString()
  slug?: string;

  // ── Lọc theo Topic ────────────────────────────────────────────────────
  @ApiPropertyOptional({ example: 1, description: 'Lọc theo topic ID (đơn)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  topic_id?: number;

  @ApiPropertyOptional({
    type: [Number],
    description: 'Lọc theo nhiều topic IDs (OR logic)',
    example: [1, 2, 3],
  })
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

  @ApiPropertyOptional({
    example: 'huong-dan',
    description: 'Lọc theo slug của topic',
  })
  @IsOptional()
  @IsString()
  topic_slug?: string;

  // ── Lọc theo Tag ──────────────────────────────────────────────────────
  @ApiPropertyOptional({ example: 1, description: 'Lọc theo tag ID (đơn)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tag_id?: number;

  @ApiPropertyOptional({
    type: [Number],
    description: 'Lọc theo nhiều tag IDs (OR logic)',
    example: [1, 2, 3],
  })
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

  // ── Lọc theo Author ──────────────────────────────────────────────────
  @ApiPropertyOptional({ example: 1, description: 'Lọc theo author ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  author_id?: number;

  @ApiPropertyOptional({
    example: 'Nguyễn',
    description: 'Tìm kiếm theo tên tác giả',
  })
  @IsOptional()
  @IsString()
  author_name?: string;

  // ── Trạng thái ────────────────────────────────────────────────────────
  @ApiPropertyOptional({
    example: true,
    description: 'Lọc theo trạng thái active',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true || value === 1 || value === '1') return true;
    if (value === 'false' || value === false || value === 0 || value === '0') return false;
    return value;
  })
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Lọc theo trạng thái published',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true || value === 1 || value === '1') return true;
    if (value === 'false' || value === false || value === 0 || value === '0') return false;
    return value;
  })
  @IsBoolean()
  is_published?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Lọc bài viết có/không có thumbnail',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true || value === 1 || value === '1') return true;
    if (value === 'false' || value === false || value === 0 || value === '0') return false;
    return value;
  })
  @IsBoolean()
  has_thumbnail?: boolean;

  // ── Khoảng thời gian published ────────────────────────────────────────
  @ApiPropertyOptional({
    example: '2024-01-01',
    description: 'Ngày xuất bản từ (publishedAt)',
  })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({
    example: '2024-12-31',
    description: 'Ngày xuất bản đến (publishedAt)',
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  // ── Khoảng thời gian tạo ─────────────────────────────────────────────
  @ApiPropertyOptional({
    example: '2024-01-01',
    description: 'Ngày tạo từ (createdAt)',
  })
  @IsOptional()
  @IsDateString()
  created_from?: string;

  @ApiPropertyOptional({
    example: '2024-12-31',
    description: 'Ngày tạo đến (createdAt)',
  })
  @IsOptional()
  @IsDateString()
  created_to?: string;

  // ── Khoảng lượt xem ──────────────────────────────────────────────────
  @ApiPropertyOptional({
    example: 100,
    description: 'Lượt xem tối thiểu',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_views?: number;

  @ApiPropertyOptional({
    example: 10000,
    description: 'Lượt xem tối đa',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  max_views?: number;

  // ── Sắp xếp ──────────────────────────────────────────────────────────
  @ApiPropertyOptional({
    description: 'Sắp xếp theo',
    enum: PostSortByEnum,
    enumName: 'PostSortByEnum',
    example: PostSortByEnum.NEWEST,
  })
  @IsOptional()
  @IsEnum(PostSortByEnum)
  sort_by?: PostSortByEnum;

  @ApiPropertyOptional({
    description: 'Hướng sắp xếp',
    enum: ['ASC', 'DESC'],
    example: 'DESC',
  })
  @IsOptional()
  @Transform(({ value }) => value?.toUpperCase())
  @IsString()
  sort_order?: 'ASC' | 'DESC';
}
