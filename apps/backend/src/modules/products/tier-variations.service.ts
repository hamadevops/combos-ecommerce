import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { Product } from 'src/database/entities/product.entity';
import { ProductTierVariation } from 'src/database/entities/product-tier-variation.entity';
import { TierOption } from 'src/database/entities/tier-option.entity';
import { ProductVariant } from 'src/database/entities/product-variant.entity';
import { VariantTierIndex } from 'src/database/entities/variant-tier-index.entity';
import { SetTierVariationsDto } from './dto/tier-variation.dto';
import { BulkUpdateVariantsDto } from './dto/bulk-update-variants.dto';

/**
 * TierVariationsService - Quản lý hệ thống biến thể sản phẩm theo tier
 * 
 * Hỗ trợ:
 * - Tạo/cập nhật tier variations cho sản phẩm (Đồng bộ hóa vi sai - Diff-based)
 * - Auto-generate variant matrix từ các tier options
 * - Bulk update giá/tồn kho cho variants
 * - Tìm sản phẩm theo ID hoặc slug
 */
@Injectable()
export class TierVariationsService {
  constructor(private readonly em: EntityManager) {}

  /**
   * Helper: Resolve product by ID or slug
   * @param idOrSlug - Product ID (number) or slug (string)
   * @param populate - Relations to populate
   */
  private async resolveProduct(
    idOrSlug: number | string,
    populate: string[] = [],
  ): Promise<Product> {
    let product: Product | null;

    if (typeof idOrSlug === 'number' || /^\d+$/.test(String(idOrSlug))) {
      const id = typeof idOrSlug === 'number' ? idOrSlug : parseInt(String(idOrSlug), 10);
      product = await this.em.findOne(Product, id, { populate: populate as any });
    } else {
      product = await this.em.findOne(Product, { slug: String(idOrSlug) } as any, { populate: populate as any });
    }

    if (!product) {
      throw new NotFoundException(`Sản phẩm với ID/slug "${idOrSlug}" không tồn tại`);
    }

    return product;
  }

  /**
   * Lấy tier variations của sản phẩm
   * @param idOrSlug - Product ID or slug
   */
  async getTierVariations(idOrSlug: number | string) {
    const product = await this.resolveProduct(idOrSlug, ['tierVariations.options']);

    return {
      productId: product.id,
      productName: product.name,
      tierVariations: product.tierVariations.getItems().map((tier) => ({
        id: tier.id,
        name: tier.name,
        tierIndex: tier.tierIndex,
        position: tier.position,
        options: tier.options.getItems().filter(o => o.isActive).map((opt) => ({
          id: opt.id,
          value: opt.value,
          imageUrl: opt.imageUrl,
          position: opt.position,
          isActive: opt.isActive,
        })),
      })),
    };
  }

  /**
   * Thiết lập tier variations cho sản phẩm (Diff-based)
   * Đồng bộ hóa thông tin và giữ nguyên ID của các biến thể/options còn sử dụng
   * @param idOrSlug - Product ID or slug
   */
  async setTierVariations(idOrSlug: number | string, dto: SetTierVariationsDto) {
    const resolvedProduct = await this.resolveProduct(idOrSlug, []);
    const productId = resolvedProduct.id;

    return await this.em.transactional(async (em) => {
      const product = await em.findOne(Product, productId, {
        populate: ['tierVariations.options', 'variants.tierIndexes.tierOption'],
      });

      if (!product) {
        throw new NotFoundException(`Sản phẩm với ID ${productId} không tồn tại`);
      }

      if (dto.tierVariations && dto.tierVariations.length > 2) {
        throw new BadRequestException('Sản phẩm chỉ được phép có tối đa 2 phân loại hàng');
      }

      // Nếu không có tier nào (simple product), xóa hoàn toàn tất cả variants
      if (!dto.tierVariations || dto.tierVariations.length === 0) {
        for (const tier of product.tierVariations.getItems()) {
          em.remove(tier);
        }
        product.tierVariations.removeAll();

        for (const variant of product.variants.getItems()) {
          product.variants.remove(variant);
          em.remove(variant);
        }

        await em.flush();
        return {
          productId: product.id,
          tierVariations: [],
          variants: [],
          message: 'Đã chuyển sản phẩm về dạng đơn giản (không có biến thể)',
        };
      }

      const existingTiers = product.tierVariations.getItems();
      const activeTierOptions: TierOption[][] = [];

      // Đồng bộ Tiers và Options
      for (let tierIndex = 0; tierIndex < dto.tierVariations.length; tierIndex++) {
        const tierDto = dto.tierVariations[tierIndex];
        let tierVariation = existingTiers.find((t) => t.tierIndex === tierIndex);

        if (!tierVariation) {
          tierVariation = em.create(ProductTierVariation, {
            product,
            name: tierDto.name,
            tierIndex,
            position: tierIndex,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          em.persist(tierVariation);
          product.tierVariations.add(tierVariation);
        } else {
          tierVariation.name = tierDto.name;
          tierVariation.updatedAt = new Date();
        }

        const existingOptions = tierVariation.options.getItems();
        const currentTierOptions: TierOption[] = [];

        for (let optIndex = 0; optIndex < tierDto.options.length; optIndex++) {
          const optDto = tierDto.options[optIndex];
          let option = existingOptions.find((o) => o.value === optDto.value);

          if (!option) {
            option = em.create(TierOption, {
              tierVariation,
              value: optDto.value,
              imageUrl: tierIndex === 0 ? optDto.imageUrl : undefined,
              position: optIndex,
              isActive: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            em.persist(option);
            tierVariation.options.add(option);
          } else {
            if (tierIndex === 0 && optDto.imageUrl !== undefined) {
              option.imageUrl = optDto.imageUrl;
            }
            option.position = optIndex;
            option.isActive = 1;
            option.updatedAt = new Date();
          }
          currentTierOptions.push(option);
        }

        // Xóa hoàn toàn các option cũ không còn được gửi lên
        const incomingValues = tierDto.options.map((o) => o.value);
        for (const oldOpt of existingOptions) {
          if (!incomingValues.includes(oldOpt.value)) {
            tierVariation.options.remove(oldOpt);
            em.remove(oldOpt);
          }
        }

        activeTierOptions.push(currentTierOptions);
      }

      // Xóa các tier thừa nếu có
      for (const oldTier of existingTiers) {
        if (oldTier.tierIndex >= dto.tierVariations.length) {
          em.remove(oldTier);
        }
      }

      await em.flush();

      // Đồng bộ ma trận variants
      if (dto.autoGenerateVariants !== false) {
        await this.syncVariantMatrix(product, activeTierOptions, em, dto.defaultPrice, dto.defaultStock);
      }

      await em.flush();

      // Load lại để trả về
      const updatedProduct = await em.findOne(Product, productId, {
        populate: ['tierVariations.options', 'variants.tierIndexes.tierOption'],
      });

      const activeVariants = updatedProduct!.variants.getItems().filter((v) => !v.deletedAt);

      return {
        productId: updatedProduct!.id,
        tierVariations: updatedProduct!.tierVariations.getItems().map((tier) => ({
          id: tier.id,
          name: tier.name,
          tierIndex: tier.tierIndex,
          options: tier.options.getItems().filter(o => o.isActive).map((opt) => ({
            id: opt.id,
            value: opt.value,
            imageUrl: opt.imageUrl,
          })),
        })),
        variantsCount: activeVariants.length,
        message: `Đã đồng bộ ${updatedProduct!.tierVariations.length} phân loại và ${activeVariants.length} biến thể hoạt động`,
      };
    });
  }

  /**
   * Đồng bộ ma trận các biến thể (diff-based)
   */
  private async syncVariantMatrix(
    product: Product,
    activeTierOptions: TierOption[][],
    em: EntityManager,
    defaultPrice?: number,
    defaultStock?: number,
  ) {
    const basePrice = defaultPrice ?? product.price ?? 0;
    const baseStock = defaultStock ?? 0;

    const existingVariants = product.variants.getItems();
    const combinations: TierOption[][] = [];
    const tier1Options = activeTierOptions[0] || [];
    const tier2Options = activeTierOptions[1] || [];

    if (tier2Options.length > 0) {
      for (const opt1 of tier1Options) {
        for (const opt2 of tier2Options) {
          combinations.push([opt1, opt2]);
        }
      }
    } else {
      for (const opt1 of tier1Options) {
        combinations.push([opt1]);
      }
    }

    const activeVariantIds = new Set<number>();

    for (const combo of combinations) {
      // Tìm xem có biến thể cũ nào khớp chính xác với combo này không
      const matchedVariant = existingVariants.find((v) => {
        if (v.deletedAt) return false;
        const vtiItems = v.tierIndexes.getItems();
        if (vtiItems.length !== combo.length) return false;

        return combo.every((opt) => vtiItems.some((vti) => vti.tierOption.id === opt.id));
      });

      if (matchedVariant) {
        matchedVariant.deletedAt = undefined;
        matchedVariant.isActive = 1;
        matchedVariant.optionIds = combo.map((o) => o.id);
        matchedVariant.optionValues = combo.map((o) => o.value);
        matchedVariant.name = combo.map((o) => o.value).join(' - ');
        activeVariantIds.add(matchedVariant.id);
      } else {
        const newVariant = this.createVariantWithTiers(
          em,
          product,
          combo,
          basePrice,
          baseStock,
        );
        newVariant.optionIds = combo.map((o) => o.id);
        newVariant.optionValues = combo.map((o) => o.value);
        product.variants.add(newVariant);
      }
    }

    // Xóa hoàn toàn các variant cũ không còn dùng
    for (const oldVariant of existingVariants) {
      if (!activeVariantIds.has(oldVariant.id)) {
        product.variants.remove(oldVariant);
        em.remove(oldVariant);
      }
    }
  }

  /**
   * Tự động tạo variant matrix từ các tier options
   */
  async generateVariantMatrix(
    idOrSlug: number | string,
    defaultPrice?: number,
    defaultStock?: number,
  ) {
    const resolvedProduct = await this.resolveProduct(idOrSlug, []);
    const productId = resolvedProduct.id;

    return await this.em.transactional(async (em) => {
      const product = await em.findOne(Product, productId, {
        populate: ['tierVariations.options', 'variants.tierIndexes.tierOption'],
      });

      if (!product) {
        throw new NotFoundException(`Sản phẩm với ID ${productId} không tồn tại`);
      }

      const tiers = product.tierVariations.getItems();
      
      if (tiers.length === 0) {
        throw new BadRequestException('Sản phẩm không có phân loại hàng để tạo biến thể');
      }

      const activeTierOptions: TierOption[][] = [];
      const tier1Options = tiers[0]?.options.getItems().filter(o => o.isActive) || [];
      const tier2Options = tiers[1]?.options.getItems().filter(o => o.isActive) || [];

      activeTierOptions.push(tier1Options);
      if (tiers[1]) {
        activeTierOptions.push(tier2Options);
      }

      await this.syncVariantMatrix(product, activeTierOptions, em, defaultPrice, defaultStock);

      await em.flush();

      const activeVariants = product.variants.getItems().filter((v) => !v.deletedAt);

      return {
        productId: product.id,
        variantsCreated: activeVariants.length,
        variants: activeVariants.map((v) => ({
          id: v.id,
          name: v.name,
          sku: v.sku,
          price: v.price,
          stock: v.stock,
        })),
      };
    });
  }

  /**
   * Bulk update giá/tồn kho cho nhiều variants
   */
  async bulkUpdateVariants(idOrSlug: number | string, dto: BulkUpdateVariantsDto) {
    const product = await this.resolveProduct(idOrSlug, ['variants']);

    const updates: { id: number; updated: boolean }[] = [];

    for (const variantUpdate of dto.variants) {
      const variant = product.variants.getItems().find((v) => v.id === variantUpdate.id);
      
      if (variant && !variant.deletedAt) {
        if (variantUpdate.price !== undefined) variant.price = variantUpdate.price;
        if (variantUpdate.salePrice !== undefined) variant.salePrice = variantUpdate.salePrice;
        if (variantUpdate.costPrice !== undefined) variant.costPrice = variantUpdate.costPrice;
        if (variantUpdate.stock !== undefined) variant.stock = variantUpdate.stock;
        if (variantUpdate.sku !== undefined) variant.sku = variantUpdate.sku;
        if (variantUpdate.isActive !== undefined) variant.isActive = variantUpdate.isActive;
        
        variant.updatedAt = new Date();
        updates.push({ id: variant.id, updated: true });
      } else {
        updates.push({ id: variantUpdate.id, updated: false });
      }
    }

    const variants = product.variants.getItems();
    if (variants.length > 0) {
      const activeVariants = variants.filter((v) => v.isActive && !v.deletedAt);
      if (activeVariants.length > 0) {
        product.price = Math.min(...activeVariants.map((v) => v.price));
        
        const salePrices = activeVariants
          .filter((v) => v.salePrice !== undefined && v.salePrice !== null)
          .map((v) => v.salePrice!);
        if (salePrices.length > 0) {
          product.salePrice = Math.min(...salePrices);
        }
        
        product.stock = activeVariants.reduce((sum, v) => sum + v.stock, 0);
      }
    }

    product.updatedAt = new Date();
    await this.em.flush();

    return {
      productId: product.id,
      updatedVariants: updates.filter((u) => u.updated).length,
      productPrice: product.price,
      productSalePrice: product.salePrice,
      productStock: product.stock,
    };
  }

  /**
   * Apply giá/tồn kho đồng nhất cho tất cả variants
   */
  async applyToAllVariants(
    idOrSlug: number | string,
    data: { price?: number; salePrice?: number; stock?: number },
  ) {
    const product = await this.resolveProduct(idOrSlug, ['variants']);
    const activeVariants = product.variants.getItems().filter((v) => !v.deletedAt);

    for (const variant of activeVariants) {
      if (data.price !== undefined) variant.price = data.price;
      if (data.salePrice !== undefined) variant.salePrice = data.salePrice;
      if (data.stock !== undefined) variant.stock = data.stock;
      variant.updatedAt = new Date();
    }

    if (data.price !== undefined) product.price = data.price;
    if (data.salePrice !== undefined) product.salePrice = data.salePrice;
    if (data.stock !== undefined) {
      product.stock = data.stock * activeVariants.length;
    }

    product.updatedAt = new Date();
    await this.em.flush();

    return {
      productId: product.id,
      variantsUpdated: activeVariants.length,
      appliedValues: data,
    };
  }

  // ─────────────────────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────────────────────

  private createVariantWithTiers(
    em: EntityManager,
    product: Product,
    options: TierOption[],
    price: number,
    stock: number,
  ): ProductVariant {
    const name = options.map((o) => o.value).join(' - ');
    
    const skuPartsEnhanced = options.map((o) => 
      o.value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-zA-Z0-9]/g, '')    // Remove non-alphanumeric
        .toUpperCase()
        .substring(0, 12)
    );

    const sku = `${product.sku || 'PRD'}-${skuPartsEnhanced.join('-')}`;

    const variant = em.create(ProductVariant, {
      product,
      name,
      sku,
      price,
      stock,
      isActive: 1,
      optionIds: options.map((o) => o.id),
      optionValues: options.map((o) => o.value),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    em.persist(variant);

    for (let i = 0; i < options.length; i++) {
      const tierIndex = em.create(VariantTierIndex, {
        variant,
        tierOption: options[i],
        tierIndex: i,
        createdAt: new Date(),
      });
      em.persist(tierIndex);
    }

    return variant;
  }
}
