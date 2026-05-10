// order-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, IsDateString, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { OrderStatus, PaymentStatus, PaymentMethod } from 'src/database/entities/order.entity';

export enum OrderSortByEnum {
  CREATED_AT = 'createdAt',
  FINAL_AMOUNT = 'finalAmount',
  STATUS = 'status',
  UPDATED_AT = 'updatedAt',
}

export class OrderQueryDto {
  // ── Phân trang ────────────────────────────────────────────────────────
  @ApiPropertyOptional({ description: 'Trang', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Số lượng mỗi trang', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  // ── Tìm kiếm ─────────────────────────────────────────────────────────
  @ApiPropertyOptional({ description: 'Tìm kiếm theo mã đơn, tên KH, SĐT' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Lọc chính xác theo số điện thoại KH', example: '0987654321' })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  // ── Trạng thái ───────────────────────────────────────────────────────
  @ApiPropertyOptional({ description: 'Lọc theo trạng thái đơn hàng', enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ description: 'Lọc theo trạng thái thanh toán', enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({ description: 'Lọc theo phương thức thanh toán', enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  // ── Khách hàng ───────────────────────────────────────────────────────
  @ApiPropertyOptional({ description: 'Lọc theo customer ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  customerId?: number;

  // ── Khoảng thời gian ─────────────────────────────────────────────────
  @ApiPropertyOptional({ description: 'Đơn hàng tạo từ ngày (YYYY-MM-DD)', example: '2026-01-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Đơn hàng tạo đến ngày (YYYY-MM-DD)', example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  // ── Khoảng giá trị ───────────────────────────────────────────────────
  @ApiPropertyOptional({ description: 'Tổng tiền tối thiểu (finalAmount)', example: 100000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @ApiPropertyOptional({ description: 'Tổng tiền tối đa (finalAmount)', example: 5000000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxAmount?: number;

  // ── Marketing Attribution ─────────────────────────────────────────────
  @ApiPropertyOptional({ description: 'Lọc theo nguồn UTM (utm_source)', example: 'tiktok' })
  @IsOptional()
  @IsString()
  utmSource?: string;

  @ApiPropertyOptional({ description: 'Lọc theo nền tảng marketing', example: 'TikTok' })
  @IsOptional()
  @IsString()
  marketingPlatform?: string;

  // ── Sắp xếp ──────────────────────────────────────────────────────────
  @ApiPropertyOptional({
    description: 'Sắp xếp theo trường',
    enum: OrderSortByEnum,
    example: OrderSortByEnum.UPDATED_AT,
  })
  @IsOptional()
  @IsEnum(OrderSortByEnum)
  sortBy?: OrderSortByEnum = OrderSortByEnum.UPDATED_AT;

  @ApiPropertyOptional({
    description: 'Hướng sắp xếp',
    enum: ['ASC', 'DESC'],
    example: 'DESC',
  })
  @IsOptional()
  @Transform(({ value }) => value?.toUpperCase())
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
