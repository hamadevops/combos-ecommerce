import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, IsEnum, IsDateString } from 'class-validator';
import { Type, Transform } from 'class-transformer';

/**
 * Enum cho các tùy chọn sắp xếp sản phẩm
 */
export enum ProductSortEnum {
  /** Mới nhất (theo ngày tạo) */
  NEWEST = 'newest',
  /** Bán chạy nhất (theo số lượng đã bán) */
  BEST_SELLING = 'best_selling',
  /** Giá từ thấp đến cao */
  PRICE_ASC = 'price_asc',
  /** Giá từ cao đến thấp */
  PRICE_DESC = 'price_desc',
  /** Tên A-Z */
  NAME_ASC = 'name_asc',
  /** Tên Z-A */
  NAME_DESC = 'name_desc',
  /** Thứ tự hiển thị tăng dần */
  DISPLAY_ORDER_ASC = 'display_order_asc',
  /** Thứ tự hiển thị giảm dần */
  DISPLAY_ORDER_DESC = 'display_order_desc',
}

/**
 * Enum cho loại query đặc biệt
 */
export enum ProductQueryTypeEnum {
  /** Sản phẩm đề xuất (featured) */
  RECOMMENDED = 'recommended',
  /** Sản phẩm có thể bạn thích */
  MAY_LIKE = 'may_like',
  /** Sản phẩm tương tự */
  SIMILAR = 'similar',
  /** Lấy toàn bộ sản phẩm cho sitemap (không phân trang) */
  SITEMAP = 'sitemap',
}

export class ProductQueryDto {
  @ApiPropertyOptional({ 
    description: 'Số trang (bắt đầu từ 1)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ 
    description: 'Số sản phẩm mỗi trang',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ 
    description: 'Từ khóa tìm kiếm theo tên sản phẩm',
    example: 'áo thun',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ 
    description: 'Lọc theo trạng thái hoạt động (0: ẩn, 1: hiện)',
    enum: [0, 1],
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  isActive?: number;

  @ApiPropertyOptional({ 
    type: [Number], 
    description: 'Lọc theo danh sách ID danh mục',
    example: [1, 2, 3],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return value;
    if (Array.isArray(value)) return value.map(Number);
    if (typeof value === 'string' && value.includes(',')) return value.split(',').map(Number);
    return [Number(value)];
  })
  @IsNumber({}, { each: true })
  category_ids?: number[];

  @ApiPropertyOptional({ 
    type: [Number], 
    description: 'Alias của category_ids (camelCase)',
    example: [1, 2, 3],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return value;
    if (Array.isArray(value)) return value.map(Number);
    if (typeof value === 'string' && value.includes(',')) return value.split(',').map(Number);
    return [Number(value)];
  })
  @IsNumber({}, { each: true })
  categoryIds?: number[];

  @ApiPropertyOptional({ 
    description: 'Lọc giá tối thiểu',
    example: 100000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_price?: number;

  @ApiPropertyOptional({ 
    description: 'Lọc giá tối đa',
    example: 500000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  max_price?: number;

  @ApiPropertyOptional({ 
    description: 'Lọc sản phẩm nổi bật (0: không, 1: có)',
    enum: [0, 1],
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true || value === 1 || value === '1') return 1;
    if (value === 'false' || value === false || value === 0 || value === '0') return 0;
    return value;
  })
  @IsNumber()
  isFeatured?: number;

  @ApiPropertyOptional({
    description: 'Lọc sản phẩm đề xuất (0: không, 1: có)',
    enum: [0, 1],
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true || value === 1 || value === '1') return 1;
    if (value === 'false' || value === false || value === 0 || value === '0') return 0;
    return value;
  })
  @IsNumber()
  isRecommended?: number;

  @ApiPropertyOptional({ 
    description: 'Sắp xếp theo',
    enum: ProductSortEnum,
    enumName: 'ProductSortEnum',
    example: ProductSortEnum.NEWEST,
  })
  @IsOptional()
  @IsEnum(ProductSortEnum)
  sort?: ProductSortEnum;

  @ApiPropertyOptional({ 
    description: 'Hướng sắp xếp',
    enum: ['ASC', 'DESC'],
    example: 'DESC',
  })
  @IsOptional()
  @IsString()
  order?: string;

  @ApiPropertyOptional({ 
    description: 'Loại query đặc biệt',
    enum: ProductQueryTypeEnum,
    enumName: 'ProductQueryTypeEnum',
    example: ProductQueryTypeEnum.RECOMMENDED,
  })
  @IsOptional()
  @IsEnum(ProductQueryTypeEnum)
  type?: ProductQueryTypeEnum;

  @ApiPropertyOptional({ 
    description: 'ID hoặc Slug sản phẩm để tìm sản phẩm tương tự (dùng với type=similar)',
    example: 'ao-thun-nam',
  })
  @IsOptional()
  @IsString()
  similar_to?: string;

  @ApiPropertyOptional({ 
    description: 'Lọc theo SKU (tìm kiếm gần đúng)',
    example: 'SP-001',
  })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ 
    description: 'Tồn kho tối thiểu',
    example: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minStock?: number;

  @ApiPropertyOptional({ 
    description: 'Tồn kho tối đa',
    example: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxStock?: number;

  @ApiPropertyOptional({ 
    description: 'Số lượng đã bán tối thiểu',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minSoldCount?: number;

  @ApiPropertyOptional({ 
    description: 'Sản phẩm tạo từ ngày (YYYY-MM-DD)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ 
    description: 'Sản phẩm tạo đến ngày (YYYY-MM-DD)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({
    description: 'Lọc sản phẩm có biến thể (true/false)',
    enum: [true, false],
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true || value === 1 || value === '1') return true;
    if (value === 'false' || value === false || value === 0 || value === '0') return false;
    return value;
  })
  hasVariants?: boolean;
}

