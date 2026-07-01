import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Topic } from '../entities/topic.entity';

export class TopicSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // Create root topics (level 0)
    const danhGia = await this.createTopic(em, {
      name: 'Đánh Giá Chi Tiết',
      description: 'Review thực tế, khách quan và chi tiết từng sản phẩm gia dụng, công nghệ.',
      level: 0,
      metaTitle: 'Đánh Giá Chi Tiết Sản Phẩm | Tạp Hóa Review',
      metaDescription: 'Tổng hợp các bài viết đánh giá thực tế và khách quan về các thiết bị gia dụng và công nghệ nổi bật.',
      metaKeywords: 'review chi tiet, danh gia san pham, review thuc te',
      sortOrder: 1,
    });

    const topList = await this.createTopic(em, {
      name: 'Top Sản Phẩm',
      description: 'Bảng xếp hạng, so sánh và gợi ý những sản phẩm đáng tiền mua nhất theo từng phân khúc.',
      level: 0,
      metaTitle: 'Top Sản Phẩm Đáng Mua Nhất | Tạp Hóa Review',
      metaDescription: 'Gợi ý danh sách sản phẩm tốt nhất, đáng mua nhất theo nhu cầu và ngân sách của bạn.',
      metaKeywords: 'top san pham, so sanh san pham, dang mua nhat',
      sortOrder: 2,
    });

    const kinhNghiem = await this.createTopic(em, {
      name: 'Kinh Nghiệm Mua Sắm',
      description: 'Cẩm nang, mẹo săn sale và hướng dẫn sử dụng sản phẩm thông thái.',
      level: 0,
      metaTitle: 'Kinh Nghiệm Mua Sắm Thông Minh | Tạp Hóa Review',
      metaDescription: 'Mách bạn các mẹo săn sale, cách phân biệt hàng thật hàng giả và hướng dẫn sử dụng sản phẩm.',
      metaKeywords: 'kinh nghiem mua sam, meo san sale, huong dan su dung',
      sortOrder: 3,
    });

    // Create level 1 topics
    await this.createTopic(em, {
      name: 'Đồ Gia Dụng',
      description: 'Review các thiết bị nhà bếp, robot lau nhà, máy giặt, điều hòa.',
      parent: danhGia,
      level: 1,
      metaTitle: 'Đánh Giá Đồ Gia Dụng | Tạp Hóa Review',
      metaDescription: 'Đánh giá chi tiết các thiết bị gia dụng thông minh trong gia đình.',
      metaKeywords: 'do gia dung, robot lau nha, may hut bui',
      sortOrder: 1,
    });

    await this.createTopic(em, {
      name: 'Thiết Bị Điện Tử',
      description: 'Đánh giá tai nghe, bàn phím, chuột và đồ chơi công nghệ.',
      parent: danhGia,
      level: 1,
      metaTitle: 'Đánh Giá Thiết Bị Điện Tử & Phụ Kiện',
      metaDescription: 'Review chân thực phụ kiện máy tính, điện thoại, thiết bị âm thanh.',
      metaKeywords: 'thiet bi dien tu, review ban phim co, tai nghe bluetooth',
      sortOrder: 2,
    });

    await this.createTopic(em, {
      name: 'Mẹo Săn Sale',
      description: 'Hướng dẫn săn mã giảm giá Shopee, Lazada, TikTok Shop.',
      parent: kinhNghiem,
      level: 1,
      metaTitle: 'Mẹo Săn Sale Giá Rẻ | Tạp Hóa Review',
      metaDescription: 'Cách lấy mã freeship, áp voucher giảm giá sâu trên các sàn TMĐT.',
      metaKeywords: 'sankho, voucher shopee, ma giam gia',
      sortOrder: 1,
    });

    await em.flush();
    console.log('✓ Tạp Hóa Review Topics seeded successfully');
  }

  private async createTopic(
    em: EntityManager,
    data: {
      name: string;
      description: string;
      parent?: Topic;
      level: number;
      metaTitle?: string;
      metaDescription?: string;
      metaKeywords?: string;
      sortOrder?: number;
    },
  ): Promise<Topic> {
    const existing = await em.findOne(Topic, { name: data.name });
    if (existing) {
      console.log(`- Topic already exists: ${data.name}`);
      return existing;
    }

    const topic = em.create(Topic, {
      name: data.name,
      slug: '', // Will be auto-generated
      description: data.description,
      parent: data.parent,
      level: data.level,
      isActive: true,
      sortOrder: data.sortOrder ?? 0,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      metaKeywords: data.metaKeywords,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    em.persist(topic);
    console.log(`✓ Created topic: ${data.name} (level ${data.level})`);
    return topic;
  }
}
