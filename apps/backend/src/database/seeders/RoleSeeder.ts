import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Role } from '../entities/role.entity';
import { RoleEnum } from '../../libs/enums/role.enum';

export class RoleSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const roles = [
      {
        name: 'Administrator',
        key: RoleEnum.ADMIN,
        is_default: 0,
      },
      {
        name: 'Manager',
        key: RoleEnum.MANAGER,
        is_default: 0,
      },
      {
        name: 'Marketing Manager',
        key: RoleEnum.MARKETING,
        is_default: 0,
      },
      {
        name: 'Product Manager',
        key: RoleEnum.PRODUCT_MANAGER,
        is_default: 0,
      },
      {
        name: 'User',
        key: RoleEnum.USER,
        is_default: 1, // Default for new customers
      },
    ];

    for (const roleData of roles) {
      // Check if role already exists by key or name
      const existingRole = await em.findOne(Role, {
        $or: [{ key: roleData.key }, { name: roleData.name }],
      });

      if (!existingRole) {
        const role = em.create(Role, {
          ...roleData,
          created_at: new Date(),
          updated_at: new Date(),
        });
        em.persist(role);
        console.log(`✓ Created role: ${roleData.name}`);
      } else {
        // Optional: Update name if key matches but name is different?
        // For now, just logging that it exists is safer to match current behavior
        console.log(`- Role already exists: ${roleData.name} (Key: ${existingRole.key})`);
      }
    }

    await em.flush();
  }
}
