import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/core';
import { Popup, PopupPosition } from '../entities/popup.entity';

export class PopupSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // Clear existing popups - optional, but good for idempotent seeds
    // await em.nativeDelete(Popup, {});

    const popups = [
      {
        title: 'Summer Sale',
        description: 'Summer Collection Sale - Up to 50% Off!',
        link: '/collections/summer-sale',
        image_url:
          'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?auto=format&fit=crop&q=80&w=600',
        priority: 10,
        status: true,
        position: PopupPosition.CENTER,
        promo_code: 'SUMMER50',
      },
      {
        title: 'New Arrivals',
        description: 'New Arrivals - Check out what is new',
        link: '/collections/new-arrivals',
        image_url:
          'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=600',
        priority: 5,
        status: true,
        position: PopupPosition.CENTER,
        promo_code: 'NEW2024',
      },
      {
        title: 'Newsletter',
        description: 'Subscribe to our newsletter',
        link: '/subscribe',
        image_url:
          'https://images.unsplash.com/photo-1555421689-d68471e189f2?auto=format&fit=crop&q=80&w=300',
        priority: 1,
        status: true,
        position: PopupPosition.SIDEBAR,
        promo_code: '',
      },
      {
        title: 'Loyalty Program',
        description: 'Join our loyalty program',
        link: '/loyalty',
        image_url:
          'https://images.unsplash.com/photo-1560769629-975e13f0c5d6?auto=format&fit=crop&q=80&w=300',
        priority: 2,
        status: true,
        position: PopupPosition.FOOTER,
        promo_code: 'LOYALTY10',
      },
      {
        title: 'Flash Sale',
        description: 'Flash Sale! 24 Hours Only',
        link: '/flash-sale',
        image_url:
          'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=600',
        priority: 20,
        status: false, // Inactive example
        position: PopupPosition.CENTER,
        promo_code: 'FLASH24',
      },
    ];

    for (const popupData of popups) {
      // Check if popup with same description exists
      let popup = await em.findOne(Popup, {
        description: popupData.description,
      });

      if (!popup) {
        popup = em.create(Popup, {
          ...popupData,
          created_at: new Date(),
          updated_at: new Date(),
        });
      } else {
        // Update existing popup with new fields
        popup.title = popupData.title;
        popup.promo_code = popupData.promo_code;
        popup.priority = popupData.priority;
        popup.position = popupData.position;
        // Don't override status if it might have been changed manually, or do? Let's update it for seed consistency.
        // popup.status = popupData.status; 
      }
      em.persist(popup);
    }

    await em.flush();
    console.log('Popups seeded successfully!');
  }
}
