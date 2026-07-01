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

    // Get categories
    const smartHome = await this.getOrCreateCategory(em, 'Đồ Gia Dụng Thông Minh');
    const techGadgets = await this.getOrCreateCategory(em, 'Đồ Công Nghệ & Gadgets');
    const homeLiving = await this.getOrCreateCategory(em, 'Nhà Cửa & Đời Sống');
    const motherBaby = await this.getOrCreateCategory(em, 'Mẹ & Bé');
    const premiumAccounts = await this.getOrCreateCategory(em, 'Tài Khoản Premium');

    // 1. Robot Hút Bụi Ecovacs T20 OMNI
    await this.createProductWithTierVariants(em, {
      name: 'Robot Hút Bụi Lau Nhà Ecovacs Deebot T20 OMNI',
      slug: 'robot-hut-bui-ecovacs-deebot-t20-omni',
      description: 'Robot hút bụi lau nhà hàng đầu hiện nay với công nghệ giặt giẻ bằng nước nóng 55°C, lực hút cực mạnh 6000Pa, tự động đổ rác và sấy khô giẻ lau bằng khí nóng. Khả năng tránh vật cản chính xác bằng công nghệ TrueDetect 3D 3.0.',
      sku: 'ECOVACS-T20',
      isActive: true,
      isFeatured: true,
      categories: [smartHome],
      productType: 'affiliate',
      affiliateLink: 'https://shope.ee/8A9B2C3D',
      images: [
        'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800&q=80',
      ],
      tier1: {
        name: 'Phiên bản',
        options: [
          { value: 'Bản Tiêu Chuẩn' },
          { value: 'Bản Pro (Kèm Nước Lau)' },
        ],
      },
      pricing: [
        { tier1Index: 0, price: 13990000, salePrice: 12990000, stock: 50 },
        { tier1Index: 1, price: 14500000, salePrice: 13500000, stock: 30 },
      ],
    });

    // 2. Ghế Công Thái Học Sihoo M57
    await this.createProductWithTierVariants(em, {
      name: 'Ghế Công Thái Học Ergonomic Sihoo M57',
      slug: 'ghe-cong-thai-hoc-sihoo-m57',
      description: 'Ghế ngồi làm việc công thái học hỗ trợ cột sống tốt nhất phân khúc, chất liệu lưới cao cấp thoáng mát, tựa tay 3D linh hoạt điều chỉnh, phù hợp cho dân văn phòng và coder ngồi làm việc thời gian dài.',
      sku: 'SIHOO-M57',
      isActive: true,
      isFeatured: true,
      categories: [homeLiving],
      productType: 'affiliate',
      affiliateLink: 'https://shope.ee/9C8D7E6F',
      images: [
        'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?w=800&q=80',
      ],
      tier1: {
        name: 'Kê chân',
        options: [
          { value: 'Không Kèm Kê Chân' },
          { value: 'Có Kèm Kê Chân' },
        ],
      },
      pricing: [
        { tier1Index: 0, price: 3250000, salePrice: 2990000, stock: 80 },
        { tier1Index: 1, price: 3750000, salePrice: 3490000, stock: 40 },
      ],
    });

    // 3. Bàn phím cơ Keychron K2 V2
    await this.createProductWithTierVariants(em, {
      name: 'Bàn Phím Cơ Không Dây Keychron K2 V2 (Hot-swap)',
      slug: 'ban-phim-co-keychron-k2-v2',
      description: 'Bàn phím cơ compact layout 75% gọn gàng, kết nối Bluetooth đa thiết bị (Windows/Mac/iOS/Android). Thiết kế khung nhôm chắc chắn, LED RGB nhiều chế độ cực đẹp mắt và hỗ trợ thay switch nóng (Hot-swap).',
      sku: 'KEYCHRON-K2-V2',
      isActive: true,
      isFeatured: true,
      categories: [techGadgets],
      productType: 'affiliate',
      affiliateLink: 'https://shope.ee/1A2B3C4D',
      images: [
        'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&q=80',
      ],
      tier1: {
        name: 'Loại Switch',
        options: [
          { value: 'Gateron Blue Switch' },
          { value: 'Gateron Brown Switch' },
          { value: 'Gateron Red Switch' },
        ],
      },
      pricing: [
        { tier1Index: 0, price: 1950000, salePrice: 1850000, stock: 20 },
        { tier1Index: 1, price: 1950000, salePrice: 1850000, stock: 30 },
        { tier1Index: 2, price: 1950000, salePrice: 1850000, stock: 25 },
      ],
    });

    // 4. Tai nghe chụp tai Sony WH-1000XM5
    await this.createProductWithTierVariants(em, {
      name: 'Tai Nghe Chống Ồn Chủ Động Sony WH-1000XM5',
      slug: 'tai-nghe-sony-wh-1000xm5',
      description: 'Tai nghe chụp tai không dây chống ồn chủ động (ANC) hàng đầu từ Sony. Bộ xử lý tích hợp V1 mang lại chất lượng âm thanh đỉnh cao không lẫn tạp âm, thời lượng pin sử dụng lên đến 30 giờ và hỗ trợ sạc nhanh tiện lợi.',
      sku: 'SONY-WH-1000XM5',
      isActive: true,
      isFeatured: true,
      categories: [techGadgets],
      productType: 'affiliate',
      affiliateLink: 'https://shope.ee/5E6F7G8H',
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      ],
      tier1: {
        name: 'Màu Sắc',
        options: [
          { value: 'Đen (Black)' },
          { value: 'Trắng Bạc (Silver)' },
        ],
      },
      pricing: [
        { tier1Index: 0, price: 6990000, salePrice: 6490000, stock: 15 },
        { tier1Index: 1, price: 6990000, salePrice: 6490000, stock: 15 },
      ],
    });

    // 5. Ấm Siêu Tốc Xiaomi Smart Kettle Pro
    await this.createProductWithTierVariants(em, {
      name: 'Ấm Siêu Tốc Thông Minh Xiaomi Smart Kettle Pro',
      slug: 'am-sieu-toc-xiaomi-smart-kettle-pro',
      description: 'Ấm đun nước siêu tốc Xiaomi tích hợp màn hình LED hiển thị nhiệt độ thực tế, hỗ trợ điều chỉnh giữ ấm thông minh ở nhiều mức độ qua ứng dụng Mi Home. Chất liệu lòng ấm bằng inox 304 an toàn cho sức khỏe.',
      sku: 'XIAOMI-KETTLE-PRO',
      isActive: true,
      isFeatured: false,
      categories: [smartHome],
      productType: 'affiliate',
      affiliateLink: 'https://shope.ee/2H3I4J5K',
      images: [
        'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80',
      ],
      tier1: {
        name: 'Bản sản phẩm',
        options: [
          { value: 'Bản Quốc Tế' },
        ],
      },
      pricing: [
        { tier1Index: 0, price: 950000, salePrice: 850000, stock: 100 },
      ],
    });

    // 6. Tài Khoản Netflix Premium 1 Tháng
    await this.createProductWithTierVariants(em, {
      name: 'Tài Khoản Netflix Premium 1 Tháng (Slot Xem Chung)',
      slug: 'tai-khoan-netflix-premium-1-thang',
      description: 'Cung cấp tài khoản Netflix Premium chất lượng 4K UHD, dùng chung 1 profile cá nhân ổn định, có đặt mã PIN khóa riêng tư. Bảo hành lỗi 1 đổi 1 trọn thời gian sử dụng.',
      sku: 'NETFLIX-PREMIUM-1M',
      isActive: true,
      isFeatured: true,
      categories: [premiumAccounts],
      productType: 'purchase',
      images: [
        'https://images.unsplash.com/photo-1574375927938-d5a98e8edd86?w=800&q=80',
      ],
      tier1: {
        name: 'Gói đăng ký',
        options: [
          { value: 'Xem Chung (1 User)' },
          { value: 'Trọn Gói (5 Users)' },
        ],
      },
      pricing: [
        { tier1Index: 0, price: 650000, salePrice: 59000, stock: 999 },
        { tier1Index: 1, price: 280000, salePrice: 260000, stock: 100 },
      ],
    });

    await em.flush();
    console.log('✓ Tạp Hóa Review Products seeded successfully');
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
      productType?: string;
      affiliateLink?: string;
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
      console.log(`- Product ${data.name} already exists. Updating properties & images...`);
      
      // Update basic fields
      existingProduct.name = data.name;
      existingProduct.description = data.description;
      existingProduct.productType = data.productType ?? 'purchase';
      existingProduct.affiliateLink = data.affiliateLink;
      
      // Remove old images specific to this product
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
      productType: data.productType ?? 'purchase',
      affiliateLink: data.affiliateLink,
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

    console.log(`✓ Created product: ${data.name}`);
    return product;
  }
}
