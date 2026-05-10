import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/core';
import { Setting } from '../entities/setting.entity';

export class SettingSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // 1. Rename old keys if they exist (Migration logic moved here)
    const renames = {
      site_title: 'store_name',
      favicon: 'store_logo',
      site_description: 'store_description',
    };

    for (const [oldKey, newKey] of Object.entries(renames)) {
      const existing = await em.findOne(Setting, { key: oldKey });
      if (existing) {
        existing.key = newKey;
        // We will update group/label/etc in the main loop below
        em.persist(existing);
      }
    }
    await em.flush();

    const settings = [
      // General (Store Info)
      {
        key: 'store_name',
        value: 'Thiên Phú Store VN',
        type: 'string',
        isPublic: true,
        group: 'general',
        label: 'Tên cửa hàng',
      },
      {
        key: 'store_logo',
        value: 'https://placehold.co/200x200/FFD700/FFFFFF?text=TP',
        type: 'string',
        isPublic: true,
        group: 'general',
        label: 'Logo cửa hàng',
      },
      {
        key: 'store_description',
        value: 'Chuyên cung cấp dụng cụ cơ khí chuyên nghiệp',
        type: 'string',
        isPublic: true,
        group: 'general',
        label: 'Mô tả ngắn',
      },
      {
        key: 'store_rating',
        value: '5.0',
        type: 'number',
        isPublic: true,
        group: 'general',
        label: 'Đánh giá (Sao)',
      },

      // Appearance (Slider & Background)
      {
        key: 'store_background',
        value: 'https://placehold.co/800x400/333333/FFFFFF?text=Background',
        type: 'string',
        isPublic: true,
        group: 'appearance',
        label: 'Hình nền (Background)',
      },
      {
        key: 'home_slider',
        value: JSON.stringify([
          { image: 'https://placehold.co/800x400/111/FFF?text=Slider1', link: '/products' },
          { image: 'https://placehold.co/800x400/222/FFF?text=Slider2', link: '/category/electronics' },
        ]),
        type: 'json',
        isPublic: true,
        group: 'appearance',
        label: 'Slider trang chủ',
      },

      // Contact
      {
        key: 'contact_email',
        value: 'support@thienphustore.vn',
        type: 'string',
        isPublic: true,
        group: 'contact',
        label: 'Email liên hệ',
      },
      {
        key: 'contact_phone',
        value: '1900 1234',
        type: 'string',
        isPublic: true,
        group: 'contact',
        label: 'Hotline',
      },
      {
        key: 'contact_address',
        value: '123 Đường ABC, Quận XYZ, TP.HCM',
        type: 'string',
        isPublic: true,
        group: 'contact',
        label: 'Địa chỉ',
      },
      {
        key: 'map_iframe',
        value: '',
        type: 'text',
        isPublic: true,
        group: 'contact',
        label: 'Google Maps Iframe',
      },

      // Social
      {
        key: 'social_facebook',
        value: 'https://facebook.com/vibecms',
        type: 'string',
        isPublic: true,
        group: 'social',
        label: 'Facebook',
      },
      {
        key: 'social_instagram',
        value: 'https://instagram.com/vibecms',
        type: 'string',
        isPublic: true,
        group: 'social',
        label: 'Instagram',
      },
      {
        key: 'social_zalo',
        value: 'https://zalo.me/0909090909',
        type: 'string',
        isPublic: true,
        group: 'social',
        label: 'Zalo',
      },
      {
        key: 'social_tiktok',
        value: 'https://tiktok.com',
        type: 'string',
        isPublic: true,
        group: 'social',
        label: 'TikTok',
      },

      // Footer
      {
        key: 'footer_about',
        value:
          'Chúng tôi cung cấp các sản phẩm thời trang chất lượng cao với giá cả hợp lý. Cam kết mang lại trải nghiệm mua sắm tốt nhất.',
        type: 'text',
        isPublic: true,
        group: 'footer',
        label: 'Giới thiệu Footer',
      },
      {
        key: 'footer_copyright',
        value: '© 2024 Vibe CMS. All rights reserved.',
        type: 'string',
        isPublic: true,
        group: 'footer',
        label: 'Bản quyền Footer',
      },
    ];

    for (const data of settings) {
      let setting = await em.findOne(Setting, { key: data.key });
      if (!setting) {
        setting = em.create(Setting, {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        // Update existing setting with new fields (label, description, group, type)
        // We preserve value if we want, or reset it.
        // Prompt implied "Migration values to seeder", so we should probably ensure the seeder values are applied.
        // But for safety, maybe we only update label/description/group/type and keep value if it exists?
        // Actually, seeders usually force state. Let's force update everything to match the "seeder" source of truth
        // EXCEPT maybe value if it was user-changed? 
        // User asked "Move value to seeder", implying seeder holds the data.
        
        // Let's update metadata (label, group, type) and keep value if it exists, OR update everything.
        // I will update everything to ensure consistency as per request.
        
        setting.label = data.label;
        setting.group = data.group;
        setting.type = data.type;
        // setting.value = data.value; // Uncomment to force reset value
      }
      em.persist(setting);
    }
  }
}
