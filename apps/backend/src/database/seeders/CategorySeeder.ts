import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Category } from '../entities/category.entity';

export class CategorySeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // 1. Dụng cụ pin
    await this.createCategory(em, {
      name: 'Dụng cụ pin',
      description: 'Các loại máy khoan, máy siết bu lông sử dụng pin',
      sortOrder: 1,
      image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80', // Yellow/Black Cordless Drill
    });

    // 2. Dụng cụ điện
    await this.createCategory(em, {
      name: 'Dụng cụ điện',
      description: 'Máy khoan, máy mài, máy cắt chạy điện',
      sortOrder: 2,
      image: 'https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?w=800&q=80', // Heavy duty concrete drill
    });

    // 3. Phụ kiện
    await this.createCategory(em, {
      name: 'Phụ kiện',
      description: 'Pin, sạc, mũi khoan và các phụ kiện khác',
      sortOrder: 3,
      image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80', // Batteries
    });

    // 4. Dụng cụ làm vườn
    await this.createCategory(em, {
      name: 'Dụng cụ làm vườn',
      description: 'Máy cưa xích, máy cắt cỏ, dụng cụ làm vườn',
      sortOrder: 4,
      image: 'https://images.unsplash.com/photo-1590233033200-a2497fbba24d?w=800&q=80', // Chainsaw
    });

    // 5. Dụng cụ tiện ích
    await this.createCategory(em, {
      name: 'Dụng cụ tiện ích',
      description: 'Máy rửa xe, máy hút bụi và các tiện ích khác',
      sortOrder: 5,
      image: 'https://images.unsplash.com/photo-1596265371388-43edb10632d4?w=800&q=80', // Car wash spray
    });

    // 6. Dụng cụ đo lường
    await this.createCategory(em, {
      name: 'Dụng cụ đo lường',
      description: 'Máy cân bằng laser, thước đo điện tử',
      sortOrder: 6,
      image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80', // Technical measurement
    });

    await em.flush();
    console.log('✓ Categories seeded successfully (Power Tools Domain)');
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
