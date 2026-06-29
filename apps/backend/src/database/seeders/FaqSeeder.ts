import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/core';
import { Faq } from '../entities/faq.entity';

export class FaqSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const faqs = [
      {
        question: 'Làm thế nào để đổi trả hàng?',
        answer:
          'Bạn có thể yêu cầu đổi trả hàng trong vòng 30 ngày kể từ ngày nhận hàng. Vui lòng liên hệ với bộ phận chăm sóc khách hàng để được hỗ trợ.',
        sortOrder: 1,
        isActive: true,
      },
      {
        question: 'Thời gian giao hàng là bao lâu?',
        answer:
          'Thời gian giao hàng tiêu chuẩn là 3-5 ngày làm việc đối với nội thành và 5-7 ngày đối với các tỉnh thành khác.',
        sortOrder: 2,
        isActive: true,
      },
      {
        question: 'Tôi có thể thanh toán khi nhận hàng không?',
        answer:
          'Có, chúng tôi hỗ trợ hình thức thanh toán khi nhận hàng (COD) cho tất cả các đơn hàng.',
        sortOrder: 3,
        isActive: true,
      },
      {
        question: 'Phí vận chuyển được tính như thế nào?',
        answer:
          'Chúng tôi miễn phí vận chuyển cho đơn hàng trên 500k. Đơn hàng dưới 500k sẽ có phí vận chuyển cố định là 30k.',
        sortOrder: 4,
        isActive: true,
      },
    ];

    for (const data of faqs) {
      const exists = await em.findOne(Faq, { question: data.question });
      if (!exists) {
        const faq = em.create(Faq, {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        em.persist(faq);
      }
    }
  }
}
