import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Product } from '../entities/product.entity';
import { ProductVariant } from '../entities/product-variant.entity';
import { ProductImage } from '../entities/product-image.entity';
import { Category } from '../entities/category.entity';
import { User } from '../entities/user.entity';
import { ProductTierVariation } from '../entities/product-tier-variation.entity';
import { TierOption } from '../entities/tier-option.entity';
import { VariantTierIndex } from '../entities/variant-tier-index.entity';

export class ProductSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    if (process.env.SEED_MOCK_DATA !== 'true') {
      console.log('- SEED_MOCK_DATA is not true, securely skipping ProductSeeder');
      return;
    }

    // Get admin user
    const admin = await em.findOne(User, { email: process.env.EMAIL_ADMIN });
    if (!admin) {
      console.log('- Admin user not found, skipping product seeding');
      return;
    }

    // Get categories (assuming CategorySeeder ran first and created these)
    const pinTools = await this.getOrCreateCategory(em, 'Dụng cụ pin');
    const electTools = await this.getOrCreateCategory(em, 'Dụng cụ điện');
    const accessories = await this.getOrCreateCategory(em, 'Phụ kiện');
    const gardenTools = await this.getOrCreateCategory(em, 'Dụng cụ làm vườn');
    const utilityTools = await this.getOrCreateCategory(em, 'Dụng cụ tiện ích');
    const measureTools = await this.getOrCreateCategory(em, 'Dụng cụ đo lường');

    // 1. Máy khoan pin Hukan (Dụng cụ pin)
    await this.createProductWithTierVariants(em, {
      name: 'Máy khoan pin Hukan XC5-21V',
      slug: 'may-khoan-pin-hukan-xc5-21v',
      description: 'Máy khoan pin Hukan công suất mạnh mẽ, động cơ không chổi than, phù hợp cho công trình.',
      sku: 'HUKAN-XC5',
      isActive: true,
      isFeatured: true,
      categories: [pinTools],
      images: [
        'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80',
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80',
      ],
      tier1: {
        name: 'Phiên bản',
        options: [
          { value: 'Thân máy (Chưa pin sạc)' },
          { value: 'Combo 1 Pin 2Ah' },
          { value: 'Combo 2 Pin 2Ah' },
        ],
      },
      pricing: [
        { tier1Index: 0, price: 850000, stock: 50 },
        { tier1Index: 1, price: 1250000, stock: 30 },
        { tier1Index: 2, price: 1550000, salePrice: 1450000, stock: 20 },
      ],
    });

    // 2. Máy đục bê tông Hukan (Dụng cụ điện)
    await this.createProductWithTierVariants(em, {
      name: 'Máy đục bê tông Hukan HK-0810',
      slug: 'may-duc-be-tong-hukan-hk-0810',
      description: 'Công suất 1300W, lực đập mạnh mẽ, chuyên dụng cho phá dỡ công trình.',
      sku: 'HUKAN-HK0810',
      isActive: true,
      isFeatured: true,
      categories: [electTools],
      images: [
        'https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?w=800&q=80',
      ],
      tier1: {
        name: 'Màu sắc',
        options: [
          { value: 'Xám Đen' },
        ],
      },
      pricing: [
        { tier1Index: 0, price: 1850000, stock: 15 },
      ],
    });

    // 3. Sạc nhanh Hukan (Phụ kiện)
    await this.createProductWithTierVariants(em, {
      name: 'Sạc nhanh Hukan 21V',
      slug: 'sac-nhanh-hukan-21v',
      description: 'Sạc bàn thông minh, tự ngắt khi đầy, bảo vệ pin.',
      sku: 'HUKAN-CHARGER-21V',
      isActive: true,
      isFeatured: false,
      categories: [accessories],
      images: [
        'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80',
      ],
      tier1: {
        name: 'Loại chân cắm',
        options: [
          { value: 'Chân phổ thông' },
        ],
      },
      pricing: [
        { tier1Index: 0, price: 250000, stock: 100 },
      ],
    });

    // 4. Máy cưa xích chạy pin (Dụng cụ làm vườn)
    await this.createProductWithTierVariants(em, {
      name: 'Máy cưa xích pin Hukan CS-06',
      slug: 'may-cua-xich-pin-hukan-cs-06',
      description: 'Lam xích 6 inch, động cơ Brushless, cắt cành cây siêu ngọt.',
      sku: 'HUKAN-CS06',
      isActive: true,
      isFeatured: true,
      categories: [gardenTools, pinTools],
      images: [
        'https://images.unsplash.com/photo-1590233033200-a2497fbba24d?w=800&q=80',
      ],
      tier1: {
        name: 'Gói sản phẩm',
        options: [
          { value: 'Body (Không pin sạc)' },
          { value: 'Trọn bộ 1 Pin 10 Cell' },
        ],
      },
      pricing: [
        { tier1Index: 0, price: 950000, stock: 40 },
        { tier1Index: 1, price: 1650000, stock: 25 },
      ],
    });

    // 5. Máy rửa xe áp lực cao (Dụng cụ tiện ích)
    await this.createProductWithTierVariants(em, {
      name: 'Máy rửa xe chỉnh áp Hukan HK-3000',
      slug: 'may-rua-xe-hukan-hk-3000',
      description: 'Công suất 3000W, có chỉnh áp, 100% dây đồng.',
      sku: 'HUKAN-HK3000',
      isActive: true,
      isFeatured: true,
      categories: [utilityTools, electTools],
      images: [
        'https://images.unsplash.com/photo-1596265371388-43edb10632d4?w=800&q=80',
      ],
      tier1: {
        name: 'Model',
        options: [
          { value: 'HK-3000 (Chỉnh áp)' },
        ],
      },
      pricing: [
        { tier1Index: 0, price: 2150000, stock: 30 },
      ],
    });

    // 6. Máy cân bằng Laser (Dụng cụ đo lường)
    await this.createProductWithTierVariants(em, {
      name: 'Máy laser Hukan 5 tia xanh',
      slug: 'may-laser-hukan-5-tia-xanh',
      description: '5 tia xanh siêu sáng, phím cảm ứng, kèm chân đế.',
      sku: 'HUKAN-LS5G',
      isActive: true,
      isFeatured: true,
      categories: [measureTools],
      images: [
        'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80',
      ],
      tier1: {
        name: 'Màu sắc máy',
        options: [
          { value: 'Cam' },
          { value: 'Xanh' },
        ],
      },
      pricing: [
        { tier1Index: 0, price: 990000, stock: 50 },
        { tier1Index: 1, price: 990000, stock: 50 },
      ],
    });

    await em.flush();
    console.log('✓ Tool Products seeded successfully');
  }

  private async getOrCreateCategory(em: EntityManager, name: string): Promise<Category> {
    const existing = await em.findOne(Category, { name });
    if (existing) return existing;

    const category = em.create(Category, {
      name,
      slug: '', // Auto-generated
      description: `Danh mục ${name}`,
      isActive: true,
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    em.persist(category);
    return category;
  }

  private async createProductWithTierVariants(
    em: EntityManager,
    data: {
      name: string;
      slug: string;
      description: string;
      sku: string;
      isActive: boolean;
      isFeatured: boolean;
      categories: Category[];
      images?: string[];
      tier1: {
        name: string;
        options: { value: string; imageUrl?: string }[];
      };
      tier2?: {
        name: string;
        options: { value: string; imageUrl?: string }[];
      };
      pricing: {
        tier1Index: number;
        tier2Index?: number;
        price: number;
        salePrice?: number;
        stock: number;
      }[];
    },
  ): Promise<Product> {
    const existingProduct = await em.findOne(Product, { sku: data.sku });

    if (existingProduct) {
      console.log(`- Product ${data.name} already exists. Updating images...`);
      // Remove old images specific to this product to fix broken ones
      const oldImages = await em.find(ProductImage, { product: existingProduct });
      em.remove(oldImages);

      // Add new images
      if (data.images) {
        data.images.forEach((url, i) => {
          const img = em.create(ProductImage, {
            product: existingProduct,
            url,
            position: i,
            altText: `${data.name} ${i + 1}`,
            createdAt: new Date(),
          });
          em.persist(img);
        });
      }
      return existingProduct;
    }

    const product = em.create(Product, {
      name: data.name,
      slug: data.slug,
      description: data.description,
      sku: data.sku,
      price: 0,
      stock: 0,
      isActive: data.isActive ? 1 : 0,
      isFeatured: data.isFeatured ? 1 : 0,
      isRecommended: 0,
      soldCount: 0,
      displayOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    for (const cat of data.categories) {
      product.categories.add(cat);
    }

    em.persist(product);

    if (data.images) {
      data.images.forEach((url, i) => {
        const img = em.create(ProductImage, {
          product,
          url,
          position: i,
          altText: `${data.name} ${i + 1}`,
          createdAt: new Date(),
        });
        em.persist(img);
      });
    }

    // Tier 1
    const tier1 = em.create(ProductTierVariation, {
      product,
      name: data.tier1.name,
      tierIndex: 0,
      position: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    em.persist(tier1);

    const tier1Options: TierOption[] = [];
    data.tier1.options.forEach((opt, i) => {
      const option = em.create(TierOption, {
        tierVariation: tier1,
        value: opt.value,
        imageUrl: opt.imageUrl,
        position: i,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      em.persist(option);
      tier1Options.push(option);
    });

    // Tier 2
    let tier2Options: TierOption[] = [];
    if (data.tier2) {
      const tier2 = em.create(ProductTierVariation, {
        product,
        name: data.tier2.name,
        tierIndex: 1,
        position: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      em.persist(tier2);

      data.tier2.options.forEach((opt, i) => {
        const option = em.create(TierOption, {
          tierVariation: tier2,
          value: opt.value,
          imageUrl: opt.imageUrl,
          position: i,
          isActive: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        em.persist(option);
        tier2Options.push(option);
      });
    }

    // Variants and Pricing
    let totalStock = 0;
    let minPrice = Infinity;
    let minSalePrice: number | undefined = undefined;

    for (const p of data.pricing) {
      const opt1 = tier1Options[p.tier1Index];
      const opt2 = p.tier2Index !== undefined ? tier2Options[p.tier2Index] : undefined;

      const suffixParts = [opt1?.value, opt2?.value].filter(Boolean) as string[];
      // Simple sanitized suffix to avoid huge SKUs
      const suffix = suffixParts
        .map(v => v.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 5))
        .join('-');

      const variantSku = `${product.sku}-${suffix}-${p.tier1Index}${p.tier2Index ?? ''}`;

      const variant = em.create(ProductVariant, {
        product,
        name: opt2 ? `${opt1.value} - ${opt2.value}` : opt1.value,
        sku: variantSku,
        price: p.price,
        salePrice: p.salePrice,
        stock: p.stock,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      em.persist(variant);

      const idx1 = em.create(VariantTierIndex, {
        variant,
        tierOption: opt1,
        tierIndex: 0,
        createdAt: new Date(),
      });
      em.persist(idx1);

      if (opt2) {
        const idx2 = em.create(VariantTierIndex, {
          variant,
          tierOption: opt2,
          tierIndex: 1,
          createdAt: new Date(),
        });
        em.persist(idx2);
      }

      totalStock += p.stock;
      if (p.price < minPrice) minPrice = p.price;
      if (p.salePrice && (!minSalePrice || p.salePrice < minSalePrice)) {
        minSalePrice = p.salePrice;
      }
    }

    product.price = minPrice;
    product.stock = totalStock;
    if (minSalePrice) product.salePrice = minSalePrice;

    console.log(`✓ Created tool product: ${data.name}`);
    return product;
  }
}
