import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/core';
import { Page } from '../entities/page.entity';

export class PageSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const pages = [
      {
        title: 'Giới thiệu',
        slug: 'about-us',
        content: `<h1>Về chúng tôi</h1><p>Chào mừng bạn đến với cửa hàng của chúng tôi. Chúng tôi chuyên cung cấp các sản phẩm chất lượng cao...</p>`,
        type: 'system',
        isActive: true,
        metaTitle: 'Giới thiệu - My Shop',
        metaDescription:
          'Tìm hiểu thêm về câu chuyện và sứ mệnh của chúng tôi.',
      },
      {
        title: 'Chính sách bảo mật',
        slug: 'privacy-policy',
        content: `<h1>Chính sách bảo mật</h1><p>Chúng tôi cam kết bảo mật thông tin cá nhân của bạn...</p>`,
        type: 'system',
        isActive: true,
        metaTitle: 'Chính sách bảo mật - My Shop',
        metaDescription: 'Chính sách bảo mật thông tin khách hàng.',
      },
      {
        title: 'Điều khoản sử dụng',
        slug: 'terms-of-service',
        content: `<h1>Điều khoản sử dụng</h1><p>Bằng việc truy cập website, bạn đồng ý với các điều khoản sau...</p>`,
        type: 'system',
        isActive: true,
        metaTitle: 'Điều khoản sử dụng - My Shop',
        metaDescription: 'Các quy định và điều khoản khi sử dụng dịch vụ.',
      },
      {
        title: 'Chính sách đổi trả',
        slug: 'return-policy',
        content: `<h1>Chính sách đổi trả</h1><p>Thông tin chi tiết về quy trình hoàn trả sản phẩm...</p>`,
        type: 'system',
        isActive: true,
        metaTitle: 'Chính sách đổi trả - My Shop',
        metaDescription: 'Quyền lợi và quy định về việc đổi trả hàng hóa.',
      },
      {
        title: 'Hướng dẫn mua hàng',
        slug: 'guide',
        content: `<h1>Hướng dẫn mua hàng</h1><p>Các bước đơn giản để đặt hàng trực tuyến...</p>`,
        type: 'system',
        isActive: true,
        metaTitle: 'Hướng dẫn mua hàng - My Shop',
        metaDescription: 'Hướng dẫn chi tiết cách thức mua sắm.',
      },
    ];

    for (const data of pages) {
      const exists = await em.findOne(Page, { slug: data.slug });
      if (!exists) {
        const page = em.create(Page, {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        em.persist(page);
      }
    }
  }
}
