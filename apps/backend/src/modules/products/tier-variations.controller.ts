import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TierVariationsService } from './tier-variations.service';
import { 
  SetTierVariationsDto, 
  GetTierVariationsResponseDto 
} from './dto/tier-variation.dto';
import { 
  BulkUpdateVariantsDto, 
  ApplyToAllVariantsDto 
} from './dto/bulk-update-variants.dto';
import { AppSwaggerTag } from '../swagger/swagger.constant';
import { Permissions } from 'src/decorators/permissions.decorator';
import { PermissionEnum } from 'src/libs/enums/permission.enum';
import { CacheService } from '../cache/cache.service';

/**
 * TierVariationsController
 * 
 * Endpoints để quản lý hệ thống biến thể sản phẩm theo tier (Shopee/TikTok style)
 */
@ApiTags(AppSwaggerTag.Product)
@Controller('products')
export class TierVariationsController {
  constructor(
    private readonly tierVariationsService: TierVariationsService,
    private readonly cacheService: CacheService,
  ) {}

  // ─────────────────────────────────────────────────────────────────
  // TIER VARIATIONS
  // ─────────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Lấy tier variations của sản phẩm' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.PRODUCT_READ)
  @ApiOkResponse({
    description: 'Tier variations của sản phẩm',
    type: GetTierVariationsResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy sản phẩm' })
  @Get(':id/tier-variations')
  async getTierVariations(@Param('id') id: string) {
    return this.tierVariationsService.getTierVariations(id);
  }

  @ApiOperation({ 
    summary: 'Thiết lập tier variations cho sản phẩm',
    description: `
      Thiết lập các phân loại hàng (tier variations) cho sản phẩm theo kiểu Shopee/TikTok.
      
      Ví dụ:
      - Tier 1: Màu sắc [Đỏ, Xanh, Vàng]
      - Tier 2: Kích thước [S, M, L, XL]
      
      Sau khi thiết lập, hệ thống sẽ tự động tạo variant matrix (Đỏ-S, Đỏ-M, ...).
    `,
  })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.PRODUCT_UPDATE)
  @ApiOkResponse({ description: 'Tier variations đã được thiết lập' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy sản phẩm' })
  @Put(':id/tier-variations')
  @ApiBody({ type: SetTierVariationsDto })
  async setTierVariations(
    @Param('id') id: string,
    @Body() dto: SetTierVariationsDto,
  ) {
    const result = await this.tierVariationsService.setTierVariations(id, dto);
    await this.cacheService.clearPattern('*products*');
    return result;
  }

  // ─────────────────────────────────────────────────────────────────
  // VARIANT MATRIX
  // ─────────────────────────────────────────────────────────────────

  @ApiOperation({ 
    summary: 'Tự động tạo variant matrix',
    description: `
      Tạo lại variant matrix từ các tier options hiện có.
      Các variants cũ sẽ bị xóa và tạo lại với giá/tồn kho mặc định.
    `,
  })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.PRODUCT_UPDATE)
  @ApiOkResponse({ description: 'Variant matrix đã được tạo' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy sản phẩm' })
  @Post(':id/generate-variants')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        defaultPrice: { type: 'number', example: 99000 },
        defaultStock: { type: 'number', example: 100 },
      },
    },
  })
  async generateVariants(
    @Param('id') id: string,
    @Body() body: { defaultPrice?: number; defaultStock?: number },
  ) {
    const result = await this.tierVariationsService.generateVariantMatrix(
      id,
      body.defaultPrice,
      body.defaultStock,
    );
    await this.cacheService.clearPattern('*products*');
    return result;
  }

  // ─────────────────────────────────────────────────────────────────
  // BULK UPDATE VARIANTS
  // ─────────────────────────────────────────────────────────────────

  @ApiOperation({ 
    summary: 'Bulk update nhiều variants cùng lúc',
    description: 'Cập nhật giá, tồn kho, SKU cho nhiều variants trong một request',
  })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.PRODUCT_UPDATE)
  @ApiOkResponse({ description: 'Variants đã được cập nhật' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy sản phẩm' })
  @Put(':id/variants/bulk')
  @ApiBody({ type: BulkUpdateVariantsDto })
  async bulkUpdateVariants(
    @Param('id') id: string,
    @Body() dto: BulkUpdateVariantsDto,
  ) {
    const result = await this.tierVariationsService.bulkUpdateVariants(id, dto);
    await this.cacheService.clearPattern('*products*');
    return result;
  }

  @ApiOperation({ 
    summary: 'Áp dụng giá/tồn kho cho tất cả variants',
    description: 'Đặt cùng giá, giá KM, hoặc tồn kho cho tất cả variants của sản phẩm',
  })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.PRODUCT_UPDATE)
  @ApiOkResponse({ description: 'Đã áp dụng cho tất cả variants' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy sản phẩm' })
  @Put(':id/variants/apply-all')
  @ApiBody({ type: ApplyToAllVariantsDto })
  async applyToAllVariants(
    @Param('id') id: string,
    @Body() dto: ApplyToAllVariantsDto,
  ) {
    const result = await this.tierVariationsService.applyToAllVariants(id, dto);
    await this.cacheService.clearPattern('*products*');
    return result;
  }
}
