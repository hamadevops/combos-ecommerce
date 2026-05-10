import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { PermissionGroup } from '../entities/permission-group.entity';

export class PermissionGroupSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const groups = [
      { key: 'product', name: 'Quản lý Sản phẩm', display_order: 1 },
      { key: 'category', name: 'Quản lý Danh mục', display_order: 2 },
      { key: 'order', name: 'Quản lý Đơn hàng', display_order: 3 },
      { key: 'customer', name: 'Quản lý Khách hàng', display_order: 4 },
      { key: 'user', name: 'Quản lý Người dùng', display_order: 5 },
      { key: 'role', name: 'Quản lý Vai trò', display_order: 6 },
      { key: 'permission', name: 'Quản lý Phân quyền', display_order: 7 },
      { key: 'post', name: 'Quản lý Bài viết', display_order: 8 },
      { key: 'topic', name: 'Quản lý Chủ đề', display_order: 9 },
      { key: 'tag', name: 'Quản lý Thẻ (Tag)', display_order: 10 },
      { key: 'faq', name: 'Quản lý FAQ', display_order: 11 },
      { key: 'page', name: 'Quản lý Trang tĩnh', display_order: 12 },
      { key: 'review', name: 'Quản lý Đánh giá', display_order: 13 },
      { key: 'popup', name: 'Quản lý Popup', display_order: 14 },
      { key: 'upload', name: 'Quản lý Tệp tin', display_order: 15 },
      { key: 'setting', name: 'Cài đặt Hệ thống', display_order: 16 },
      { key: 'cache', name: 'Quản lý Cache', display_order: 17 },
      { key: 'webhook', name: 'Quản lý Webhook', display_order: 18 },
      { key: 'dashboard', name: 'Tổng quan (Dashboard)', display_order: 19 },
    ];

    for (const groupData of groups) {
      const existing = await em.findOne(PermissionGroup, { key: groupData.key });

      if (existing) {
        existing.name = groupData.name;
        existing.display_order = groupData.display_order;
        console.log(`~ Updated permission group: ${groupData.name}`);
      } else {
        const group = em.create(PermissionGroup, {
          ...groupData,
          created_at: new Date(),
          updated_at: new Date(),
        });
        em.persist(group);
        console.log(`✓ Created permission group: ${groupData.name}`);
      }
    }

    await em.flush();
  }
}
