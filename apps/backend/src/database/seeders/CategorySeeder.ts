import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Category } from '../entities/category.entity';

export class CategorySeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // 1. Đồ Gia Dụng Thông Minh
    await this.createCategory(em, {
      name: 'Đồ Gia Dụng Thông Minh',
      description: 'Các thiết bị gia dụng hiện đại, robot hút bụi, máy lọc không khí giúp tối ưu hóa cuộc sống.',
      sortOrder: 1,
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80',
    });

    // 2. Đồ Công Nghệ & Gadgets
    await this.createCategory(em, {
      name: 'Đồ Công Nghệ & Gadgets',
      description: 'Tai nghe, bàn phím cơ, củ sạc nhanh và những món đồ chơi công nghệ không thể bỏ lỡ.',
      sortOrder: 2,
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
    });

    // 3. Nhà Cửa & Đời Sống
    await this.createCategory(em, {
      name: 'Nhà Cửa & Đời Sống',
      description: 'Nội thất, đèn ngủ thông minh, đồ trang trí góc làm việc tạo không gian đầy cảm hứng.',
      sortOrder: 3,
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80',
    });

    // 4. Mẹ & Bé
    await this.createCategory(em, {
      name: 'Mẹ & Bé',
      description: 'Sản phẩm chăm sóc trẻ em, xe bảo vệ, bình sữa chất lượng cao cho mẹ và bé.',
      sortOrder: 4,
      image: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?w=800&q=80',
    });

    // 5. Tài Khoản Premium
    await this.createCategory(em, {
      name: 'Tài Khoản Premium',
      description: 'Các tài khoản học tập, làm việc, giải trí Premium chính hãng giá rẻ.',
      sortOrder: 5,
      image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80',
    });

    await em.flush();
    console.log('✓ Categories seeded successfully (Tạp Hóa Review Domain)');
  }

  private async createCategory(
    em: EntityManager,
    data: {
      name: string;
      description: string;
      parent?: Category;
      metaTitle?: string;
      metaDescription?: string;
      metaKeywords?: string;
      sortOrder?: number;
      image?: string;
    },
  ): Promise<Category> {
    const existing = await em.findOne(Category, { name: data.name });
    if (existing) {
      console.log(`- Category already exists: ${data.name}`);
      // Update image if needed
      if (data.image && !existing.image) {
        existing.image = data.image;
      }
      return existing;
    }

    const category = em.create(Category, {
      name: data.name,
      slug: '', // Will be auto-generated
      description: data.description,
      parent: data.parent,
      isActive: true,
      sortOrder: data.sortOrder ?? 0,
      metaTitle: data.metaTitle ?? data.name,
      metaDescription: data.metaDescription ?? data.description,
      metaKeywords: data.metaKeywords,
      image: data.image,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    em.persist(category);
    console.log(`✓ Created category: ${data.name}`);
    return category;
  }
}
