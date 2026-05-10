// update-order.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';
import { OrderStatus, PaymentStatus } from 'src/database/entities/order.entity';

export class UpdateOrderDto {
  // ── Status ──────────────────────────────────────────────────────────
  @ApiPropertyOptional({ description: 'Trạng thái đơn hàng', enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ description: 'Trạng thái thanh toán', enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  // ── Thông tin khách hàng ─────────────────────────────────────────────
  @ApiPropertyOptional({ description: 'Tên khách hàng', example: 'Nguyễn Văn A' })
  @IsOptional()
  @Transform(({ value }) => value || undefined)
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại', example: '0987654321' })
  @IsOptional()
  @Transform(({ value }) => value || undefined)
  @IsString()
  customerPhone?: string;

  @ApiPropertyOptional({ description: 'Email khách hàng', example: 'customer@example.com' })
  @IsOptional()
  @Transform(({ value }) => value || undefined)
  @IsEmail()
  customerEmail?: string;

  // ── Thông tin giao hàng ──────────────────────────────────────────────
  @ApiPropertyOptional({ description: 'Địa chỉ giao hàng' })
  @IsOptional()
  @Transform(({ value }) => value || undefined)
  @IsString()
  shippingAddress?: string;

  @ApiPropertyOptional({ description: 'Tỉnh / Thành phố' })
  @IsOptional()
  @Transform(({ value }) => value || undefined)
  @IsString()
  shippingCity?: string;

  @ApiPropertyOptional({ description: 'Quận / Huyện' })
  @IsOptional()
  @Transform(({ value }) => value || undefined)
  @IsString()
  shippingDistrict?: string;

  @ApiPropertyOptional({ description: 'Phường / Xã' })
  @IsOptional()
  @Transform(({ value }) => value || undefined)
  @IsString()
  shippingWard?: string;

  // ── Ghi chú ──────────────────────────────────────────────────────────
  @ApiPropertyOptional({ description: 'Ghi chú đơn hàng' })
  @IsOptional()
  @IsString()
  notes?: string;
}
