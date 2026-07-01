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
        value: 'Tạp Hóa Review',
        type: 'string',
        isPublic: true,
        group: 'general',
        label: 'Tên cửa hàng',
      },
      {
        key: 'store_logo',
        value: '/ecommerce/tap_hoa_review_logo.svg',
        type: 'string',
        isPublic: true,
        group: 'general',
        label: 'Logo cửa hàng',
      },
      {
        key: 'store_description',
        value: 'Kênh đánh giá sản phẩm trung thực và link mua hàng affiliate chất lượng, giá rẻ.',
        type: 'string',
        isPublic: true,
        group: 'general',
        label: 'Mô tả ngắn',
      },
      {
        key: 'store_rating',
        value: '4.9',
        type: 'number',
        isPublic: true,
        group: 'general',
        label: 'Đánh giá (Sao)',
      },

      // Appearance (Slider & Background)
      {
        key: 'store_background',
        value: 'https://images.unsplash.com/photo-1618005198143-e5283b519a7f?auto=format&fit=crop&w=1920&q=80',
        type: 'string',
        isPublic: true,
        group: 'appearance',
        label: 'Hình nền (Background)',
      },
      {
        key: 'client_theme',
        value: 'tiktok',
        type: 'string',
        isPublic: true,
        group: 'appearance',
        label: 'Giao diện client',
        description: 'Chọn giao diện hiển thị cho website (tiktok hoặc muabantaikhoan)',
      },
      {
        key: 'home_slider',
        value: JSON.stringify([
          { image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&h=500&q=80', link: '/category/do-gia-dung-thong-minh' },
          { image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1200&h=500&q=80', link: '/category/do-cong-nghe-gadgets' },
          { image: 'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?auto=format&fit=crop&w=1200&h=500&q=80', link: '/category/nha-cua-doi-song' }
        ]),
        type: 'json',
        isPublic: true,
        group: 'appearance',
        label: 'Slider trang chủ',
      },

      // Contact
      {
        key: 'contact_email',
        value: 'contact@taphoareview.com',
        type: 'string',
        isPublic: true,
        group: 'contact',
        label: 'Email liên hệ',
      },
      {
        key: 'contact_phone',
        value: '0987 654 321',
        type: 'string',
        isPublic: true,
        group: 'contact',
        label: 'Hotline',
      },
      {
        key: 'contact_address',
        value: '195 Điện Biên Phủ, Phường 15, Quận Bình Thạnh, TP. Hồ Chí Minh',
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
        value: 'https://facebook.com/taphoareview',
        type: 'string',
        isPublic: true,
        group: 'social',
        label: 'Facebook',
      },
      {
        key: 'social_instagram',
        value: 'https://instagram.com/taphoareview',
        type: 'string',
        isPublic: true,
        group: 'social',
        label: 'Instagram',
      },
      {
        key: 'social_zalo',
        value: 'https://zalo.me/0987654321',
        type: 'string',
        isPublic: true,
        group: 'social',
        label: 'Zalo',
      },
      {
        key: 'social_tiktok',
        value: 'https://tiktok.com/@taphoareview',
        type: 'string',
        isPublic: true,
        group: 'social',
        label: 'TikTok',
      },

      // Footer
      {
        key: 'footer_about',
        value:
          'Tạp Hóa Review là trang chuyên đánh giá, trải nghiệm và giới thiệu các sản phẩm gia dụng, công nghệ, nhà cửa đời sống tốt nhất. Chúng tôi giúp bạn đưa ra lựa chọn mua sắm đúng đắn nhất thông qua các đánh giá khách quan và đường link mua sắm affiliate uy tín.',
        type: 'text',
        isPublic: true,
        group: 'footer',
        label: 'Giới thiệu Footer',
      },
      {
        key: 'footer_copyright',
        value: '© 2026 Tạp Hóa Review. Tất cả quyền được bảo lưu.',
        type: 'string',
        isPublic: true,
        group: 'footer',
        label: 'Bản quyền Footer',
      },
      {
        key: 'main_menu',
        value: JSON.stringify([
          { title: 'Trang chủ', url: '/' },
          { title: 'Giới thiệu', url: '/pages/about-us' },
          { title: 'Danh mục sản phẩm', url: '/danh-muc', isCategoryList: true },
          { title: 'Tin tức công nghệ', url: '/tin-tuc' },
          { title: 'Liên hệ', url: '/lien-he' }
        ]),
        type: 'json',
        isPublic: true,
        group: 'menu',
        label: 'Menu chính',
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
        setting.label = data.label;
        setting.group = data.group;
        setting.type = data.type;
        setting.description = data.description;
        setting.value = data.value; // Force update value
      }
      em.persist(setting);
    }
  }
}
