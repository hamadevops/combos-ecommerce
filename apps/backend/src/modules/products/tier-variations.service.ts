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
 * - Tạo/cập nhật tier variations cho sản phẩm
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

    // Nếu là số hoặc string chỉ chứa số => tìm theo ID
    if (typeof idOrSlug === 'number' || /^\d+$/.test(String(idOrSlug))) {
      const id = typeof idOrSlug === 'number' ? idOrSlug : parseInt(String(idOrSlug), 10);
      product = await this.em.findOne(Product, id, { populate: populate as any });
    } else {
      // Tìm theo slug
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
        options: tier.options.getItems().map((opt) => ({
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
   * Thiết lập tier variations cho sản phẩm
   * Sẽ xóa toàn bộ tiers/options/variants cũ và tạo mới
   * @param idOrSlug - Product ID or slug
   */
  async setTierVariations(idOrSlug: number | string, dto: SetTierVariationsDto) {
    // Resolve product first to get the ID
    const resolvedProduct = await this.resolveProduct(idOrSlug, []);
    const productId = resolvedProduct.id;

    return await this.em.transactional(async (em) => {
      const product = await em.findOne(Product, productId, {
        populate: ['tierVariations.options', 'variants.tierIndexes'],
      });

      if (!product) {
        throw new NotFoundException(`Sản phẩm với ID ${productId} không tồn tại`);
      }

      // Validate: Tối đa 2 tiers
      if (dto.tierVariations && dto.tierVariations.length > 2) {
        throw new BadRequestException('Sản phẩm chỉ được phép có tối đa 2 phân loại hàng');
      }

      // Xóa toàn bộ tier variations cũ (cascade sẽ xóa options)
      for (const tier of product.tierVariations.getItems()) {
        em.remove(tier);
      }
      product.tierVariations.removeAll();

      // Xóa toàn bộ variants cũ
      for (const variant of product.variants.getItems()) {
        em.remove(variant);
      }
      product.variants.removeAll();

      // Nếu không có tier nào (simple product), return
      if (!dto.tierVariations || dto.tierVariations.length === 0) {
        await em.flush();
        return {
          productId: product.id,
          tierVariations: [],
          variants: [],
          message: 'Đã chuyển sản phẩm về dạng đơn giản (không có biến thể)',
        };
      }

      // Tạo tier variations mới
      for (let tierIndex = 0; tierIndex < dto.tierVariations.length; tierIndex++) {
        const tierDto = dto.tierVariations[tierIndex];
        
        const tierVariation = em.create(ProductTierVariation, {
          product,
          name: tierDto.name,
          tierIndex,
          position: tierIndex,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
        em.persist(tierVariation);

        // Tạo options cho tier này
        if (tierDto.options && tierDto.options.length > 0) {
          for (let optIndex = 0; optIndex < tierDto.options.length; optIndex++) {
            const optDto = tierDto.options[optIndex];
            
            const option = em.create(TierOption, {
              tierVariation,
              value: optDto.value,
              imageUrl: tierIndex === 0 ? optDto.imageUrl : undefined, // Chỉ tier1 có ảnh
              position: optIndex,
              isActive: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            
            em.persist(option);
          }
        }
      }

      await em.flush();

      // Auto-generate variants nếu được yêu cầu
      if (dto.autoGenerateVariants !== false) {
        await this.generateVariantMatrix(productId, dto.defaultPrice, dto.defaultStock);
      }

      // Fetch lại để return
      const updatedProduct = await em.findOne(Product, productId, {
        populate: ['tierVariations.options', 'variants.tierIndexes.tierOption'],
      });

      return {
        productId: updatedProduct!.id,
        tierVariations: updatedProduct!.tierVariations.getItems().map((tier) => ({
          id: tier.id,
          name: tier.name,
          tierIndex: tier.tierIndex,
          options: tier.options.getItems().map((opt) => ({
            id: opt.id,
            value: opt.value,
            imageUrl: opt.imageUrl,
          })),
        })),
        variantsCount: updatedProduct!.variants.length,
        message: `Đã tạo ${updatedProduct!.tierVariations.length} phân loại và ${updatedProduct!.variants.length} biến thể`,
      };
    });
  }

  /**
   * Tự động tạo variant matrix từ các tier options
   * 
   * Ví dụ:
   * - Tier 1: Màu sắc [Đỏ, Xanh]
   * - Tier 2: Size [S, M, L]
   * => Tạo 6 variants: Đỏ-S, Đỏ-M, Đỏ-L, Xanh-S, Xanh-M, Xanh-L
   * @param idOrSlug - Product ID or slug
   */
  async generateVariantMatrix(
    idOrSlug: number | string,
    defaultPrice?: number,
    defaultStock?: number,
  ) {
    // Resolve product first to get the ID
    const resolvedProduct = await this.resolveProduct(idOrSlug, []);
    const productId = resolvedProduct.id;

    return await this.em.transactional(async (em) => {
      const product = await em.findOne(Product, productId, {
        populate: ['tierVariations.options', 'variants'],
      });

      if (!product) {
        throw new NotFoundException(`Sản phẩm với ID ${productId} không tồn tại`);
      }

      const tiers = product.tierVariations.getItems();
      
      if (tiers.length === 0) {
        throw new BadRequestException('Sản phẩm không có phân loại hàng để tạo biến thể');
      }

      // Xóa variants cũ
      for (const variant of product.variants.getItems()) {
        em.remove(variant);
      }
      product.variants.removeAll();

      const basePrice = defaultPrice ?? product.price ?? 0;
      const baseStock = defaultStock ?? 0;

      // Lấy options từ các tier
      const tier1Options = tiers[0]?.options.getItems().filter(o => o.isActive) || [];
      const tier2Options = tiers[1]?.options.getItems().filter(o => o.isActive) || [];

      const variantsCreated: ProductVariant[] = [];

      if (tier2Options.length > 0) {
        // 2 tiers: Cartesian product
        for (const opt1 of tier1Options) {
          for (const opt2 of tier2Options) {
            const variant = this.createVariantWithTiers(
              em,
              product,
              [opt1, opt2],
              basePrice,
              baseStock,
            );
            variantsCreated.push(variant);
          }
        }
      } else {
        // 1 tier only
        for (const opt1 of tier1Options) {
          const variant = this.createVariantWithTiers(
            em,
            product,
            [opt1],
            basePrice,
            baseStock,
          );
          variantsCreated.push(variant);
        }
      }

      await em.flush();

      return {
        productId: product.id,
        variantsCreated: variantsCreated.length,
        variants: variantsCreated.map((v) => ({
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
   * @param idOrSlug - Product ID or slug
   */
  async bulkUpdateVariants(idOrSlug: number | string, dto: BulkUpdateVariantsDto) {
    // Resolve product first to get the product with variants
    const product = await this.resolveProduct(idOrSlug, ['variants']);

    const updates: { id: number; updated: boolean }[] = [];

    for (const variantUpdate of dto.variants) {
      const variant = product.variants.getItems().find((v) => v.id === variantUpdate.id);
      
      if (variant) {
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

    // Cập nhật giá/tồn kho ở product level (lấy min price, tổng stock)
    const variants = product.variants.getItems();
    if (variants.length > 0) {
      const activeVariants = variants.filter((v) => v.isActive);
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
   * @param idOrSlug - Product ID or slug
   */
  async applyToAllVariants(
    idOrSlug: number | string,
    data: { price?: number; salePrice?: number; stock?: number },
  ) {
    // Resolve product first
    const product = await this.resolveProduct(idOrSlug, ['variants']);

    for (const variant of product.variants.getItems()) {
      if (data.price !== undefined) variant.price = data.price;
      if (data.salePrice !== undefined) variant.salePrice = data.salePrice;
      if (data.stock !== undefined) variant.stock = data.stock;
      variant.updatedAt = new Date();
    }

    // Update product-level values
    if (data.price !== undefined) product.price = data.price;
    if (data.salePrice !== undefined) product.salePrice = data.salePrice;
    if (data.stock !== undefined) {
      product.stock = data.stock * product.variants.length;
    }

    product.updatedAt = new Date();
    await this.em.flush();

    return {
      productId: product.id,
      variantsUpdated: product.variants.length,
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
    // Generate variant name from options
    const name = options.map((o) => o.value).join(' - ');
    
    // Generate SKU
    // Logic: Lấy chữ cái đầu của mỗi từ trong value, uppercase, remove special chars
    // Ví dụ: "Titan Đen" -> "TD", "Titan Xanh" -> "TX", "Size XL" -> "SXL"
    const skuParts = options.map((o) => {
      const acronym = o.value
        .split(/\s+/)
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase();
      
      // Nếu acronym quá ngắn (<2 chars) hoặc trùng lặp nhiều, có thể append thêm chars
      // Nhưng tạm thời simple acronym là đủ cho case này
      // Fallback: nếu acronym rỗng (e.g. toàn special chars), dùng value gốc
      return acronym.length > 0 ? acronym : o.value.substring(0, 3).toUpperCase();
    });

    // Thêm random suffix để đảm bảo unique tuyệt đối nếu options giống nhau về acronym
    // Thực tế options trong cùng 1 tier phải khác nhau value, nên acronym có thể trùng 
    // (VD: "Xanh Lơ" vs "Xanh Lam" => XL, XL).
    // Giải pháp tốt hơn: Dùng slugify hoặc giữ nguyên value nhưng remove space
    // Tạm dùng logic: value không dấu, remove space
    const skuPartsEnhanced = options.map((o) => 
      o.value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-zA-Z0-9]/g, '')    // Remove non-alphanumeric
        .toUpperCase()
        .substring(0, 12)                 // Limit length
    );

    const sku = `${product.sku || 'PRD'}-${skuPartsEnhanced.join('-')}`;

    const variant = em.create(ProductVariant, {
      product,
      name,
      sku,
      price,
      stock,
      isActive: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    em.persist(variant);

    // Tạo tier indexes để liên kết variant với options
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
