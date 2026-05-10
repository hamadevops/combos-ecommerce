import { Seeder } from '@mikro-orm/seeder';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { hashPassword } from '../../common/utils/password.util';
import { config } from 'dotenv';
import { RoleSeeder } from './RoleSeeder';
import { PermissionGroupSeeder } from './PermissionGroupSeeder';
import { PermissionSeeder } from './PermissionSeeder';
import { RolePermissionSeeder } from './RolePermissionSeeder';
import { CategorySeeder } from './CategorySeeder';
import { TopicSeeder } from './TopicSeeder';
import { TagSeeder } from './TagSeeder';
import { PostSeeder } from './PostSeeder';
import { ProductSeeder } from './ProductSeeder';

import { PopupSeeder } from './PopupSeeder';
import { FaqSeeder } from './FaqSeeder';
import { PageSeeder } from './PageSeeder';
import { SettingSeeder } from './SettingSeeder';


config();

/**
 * Main database seeder
 * This will seed roles, permissions, role-permissions, and create admin user
 */
export class DatabaseSeeder extends Seeder {
  async run(em: any): Promise<void> {
    // Run role seeder first
    await this.call(em, [RoleSeeder]);

    // Run permission group seeder (must run before permissions)
    await this.call(em, [PermissionGroupSeeder]);

    // Then run permission seeder
    await this.call(em, [PermissionSeeder]);

    // Then assign permissions to roles
    await this.call(em, [RolePermissionSeeder]);

    // Create admin user immediately after roles/permissions so other seeders can use it
    const adminRole = await em.findOne(Role, { key: 'admin' });
    if (!adminRole) {
      throw new Error('Admin role not found. Seeders may have failed.');
    }

    const existingAdmin = await em.findOne(User, {
      email: String(process.env.EMAIL_ADMIN),
    });

    if (!existingAdmin) {
      const passwd = await hashPassword(String(process.env.PASSWORD_ADMIN));
      const adminUser = em.create(User, {
        name: String(process.env.ADMIN_NAME),
        email: String(process.env.EMAIL_ADMIN),
        password: passwd,
        role: adminRole,
      });

      await em.persistAndFlush(adminUser);
      console.log('Admin user created successfully!');
    } else {
      console.log('Admin user already exists, skipping...');
    }

    // Optionally Seed mock data
    if (process.env.SEED_MOCK_DATA === 'true') {
      console.log('Seeding mock data (SEED_MOCK_DATA is true)...');

      // Seed categories
      await this.call(em, [CategorySeeder]);

      // Seed blog-related data
      await this.call(em, [TopicSeeder]);
      await this.call(em, [TagSeeder]);
      await this.call(em, [PostSeeder]);

      // Seed products
      await this.call(em, [ProductSeeder]);

      // Seed popups
      await this.call(em, [PopupSeeder]);

      // Seed new modules
      await this.call(em, [FaqSeeder]);
      await this.call(em, [PageSeeder]);
      await this.call(em, [SettingSeeder]);
    } else {
      console.log('Skipping mock data (Categories, Products, Posts, etc.). Set SEED_MOCK_DATA=true in .env to seed them.');
    }

    // Settings are usually essential
  }
}
