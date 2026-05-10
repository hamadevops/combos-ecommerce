// create-order.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsArray,
  ValidateNested,
  IsNumber,
  IsEnum,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from 'src/database/entities/order.entity';

export class CreateOrderItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNumber()
  productId: number;

  @ApiPropertyOptional({ description: 'Product Variant ID' })
  @IsOptional()
  @IsNumber()
  productVariantId?: number;

  @ApiProperty({ description: 'Số lượng', minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  // Customer info
  @ApiProperty({ description: 'Tên khách hàng' })
  @IsString()
  @MaxLength(255)
  customerName: string;

  @ApiPropertyOptional({ description: 'Email khách hàng' })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  customerEmail?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  customerPhone?: string;

  // Shipping info
  @ApiPropertyOptional({ description: 'Địa chỉ giao hàng' })
  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @ApiPropertyOptional({ description: 'Tỉnh/Thành phố' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  shippingCity?: string;

  @ApiPropertyOptional({ description: 'Quận/Huyện' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  shippingDistrict?: string;

  @ApiPropertyOptional({ description: 'Phường/Xã' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  shippingWard?: string;

  @ApiPropertyOptional({ description: 'Ghi chú' })
  @IsOptional()
  @IsString()
  notes?: string;

  // Payment
  @ApiPropertyOptional({
    description: 'Phương thức thanh toán',
    enum: PaymentMethod,
    default: PaymentMethod.COD,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod = PaymentMethod.COD;

  @ApiPropertyOptional({ description: 'Phí vận chuyển', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingFee?: number = 0;

  @ApiPropertyOptional({ description: 'Giảm giá', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number = 0;

  // Tracking & Marketing
  @ApiPropertyOptional({ description: 'Nguồn chiến dịch (utm_source)' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  utmSource?: string;

  @ApiPropertyOptional({ description: 'Phương tiện chiến dịch (utm_medium)' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  utmMedium?: string;

  @ApiPropertyOptional({ description: 'Tên chiến dịch (utm_campaign)' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  utmCampaign?: string;

  @ApiPropertyOptional({ description: 'Từ khóa chiến dịch (utm_term)' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  utmTerm?: string;

  @ApiPropertyOptional({ description: 'Nội dung chiến dịch (utm_content)' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  utmContent?: string;

  @ApiPropertyOptional({ description: 'Nền tảng Marketing (Tiktok, Facebook, Google, ...)' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  marketingPlatform?: string;

  @ApiPropertyOptional({ description: 'ID nền tảng Marketing (ttclid, fbclid, clickId, ...)' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  marketingPlatformId?: string;

  // Items
  @ApiProperty({ description: 'Danh sách sản phẩm', type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
