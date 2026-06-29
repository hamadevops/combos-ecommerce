import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { AppFeedback } from '../entities/app-feedback.entity';

export class AppFeedbackSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const feedbacks = [
      {
        customerName: 'Trần Minh Hoàng',
        customerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        content: 'Ứng dụng chạy rất nhanh, mượt mà và giao diện rất trực quan. Tôi cực kỳ hài lòng với dịch vụ hỗ trợ khách hàng của đội ngũ phát triển.',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800', // Mock screenshot/workspace image
        isActive: true,
        sortOrder: 1,
      },
      {
        customerName: 'Nguyễn Thị Lan Anh',
        customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        content: 'Chức năng quản lý và thống kê đơn hàng rất chi tiết, giúp tôi tiết kiệm được rất nhiều thời gian vận hành cửa hàng của mình.',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
        isActive: true,
        sortOrder: 2,
      },
      {
        customerName: 'Phạm Đức Hải',
        customerAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
        content: 'Hệ thống phân quyền chi tiết và bảo mật cao. Việc tích hợp các phương thức thanh toán cũng cực kỳ nhanh chóng.',
        rating: 4,
        image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800',
        isActive: true,
        sortOrder: 3,
      },
      {
        customerName: 'Lê Thu Trang',
        customerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        content: 'Giao diện mobile responsive rất đẹp, khách hàng của tôi phản hồi mua sắm cực kỳ tiện lợi và dễ dùng.',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
        isActive: true,
        sortOrder: 4,
      },
    ];

    for (const fbData of feedbacks) {
      const existing = await em.findOne(AppFeedback, { customerName: fbData.customerName });
      if (!existing) {
        const feedback = em.create(AppFeedback, {
          ...fbData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        em.persist(feedback);
        console.log(`✓ Created app feedback: ${fbData.customerName}`);
      } else {
        existing.customerAvatar = fbData.customerAvatar;
        existing.content = fbData.content;
        existing.rating = fbData.rating;
        existing.image = fbData.image;
        existing.sortOrder = fbData.sortOrder;
        console.log(`- Updated app feedback: ${fbData.customerName}`);
      }
    }

    await em.flush();
  }
}
