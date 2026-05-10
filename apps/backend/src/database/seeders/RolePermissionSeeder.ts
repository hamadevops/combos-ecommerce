import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { RoleEnum } from '../../libs/enums/role.enum';
import { PermissionEnum } from '../../libs/enums/permission.enum';

export class RolePermissionSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // Get roles
    const adminRole = await em.findOne(Role, { key: RoleEnum.ADMIN });
    const managerRole = await em.findOne(Role, { key: RoleEnum.MANAGER });
    const userRole = await em.findOne(Role, { key: RoleEnum.USER });
    const memberRole = await em.findOne(Role, { key: 'member' });

    if (!adminRole || !managerRole || !userRole) {
      throw new Error('Roles not found. Please run RoleSeeder first.');
    }

    // Get all permissions
    const allPermissions = await em.find(Permission, {});

    // Admin gets all permissions
    console.log('Assigning permissions to Admin role...');
    for (const permission of allPermissions) {
      const exists = await em.findOne(RolePermission, {
        role: adminRole,
        permission,
      });

      if (!exists) {
        const rolePermission = em.create(RolePermission, {
          role: adminRole,
          permission,
          created_at: new Date(),
          updated_at: new Date(),
        });
        em.persist(rolePermission);
      }
    }

    // Manager role
    // Manager manages everything EXCEPT User admin stuff (User, Role, Permission)
    console.log('Assigning permissions to Manager role...');
    const allManagerPermissions = allPermissions.filter((p) => {
      const isUserAdmin =
        p.key.startsWith('user.') ||
        p.key.startsWith('role.') ||
        p.key.startsWith('permission.');
      
      // Exception: Allow reading user profile
      if (p.key === PermissionEnum.USER_READ_PROFILE) {
        return true;
      }
      
      return !isUserAdmin;
    });

    for (const permission of allManagerPermissions) {
      const exists = await em.findOne(RolePermission, {
        role: managerRole,
        permission,
      });

      if (!exists) {
        const rolePermission = em.create(RolePermission, {
          role: managerRole,
          permission,
          created_at: new Date(),
          updated_at: new Date(),
        });
        em.persist(rolePermission);
      }
    }

    // Marketing Manager role
    console.log('Assigning permissions to Marketing Manager role...');
    const marketingRole = await em.findOne(Role, { key: RoleEnum.MARKETING });
    if (marketingRole) {
      const marketingPermissionKeys = [
        PermissionEnum.PRODUCT_READ, // Can view products
        PermissionEnum.PRODUCT_UPDATE, // Can update descriptions/SEO
        PermissionEnum.CATEGORY_READ,
        PermissionEnum.POST_CREATE,
        PermissionEnum.POST_READ,
        PermissionEnum.POST_UPDATE,
        PermissionEnum.POST_DELETE,
        PermissionEnum.POST_PUBLISH,
        PermissionEnum.TOPIC_CREATE,
        PermissionEnum.TOPIC_READ,
        PermissionEnum.TOPIC_UPDATE,
        PermissionEnum.TOPIC_DELETE,
        PermissionEnum.TAG_CREATE,
        PermissionEnum.TAG_READ,
        PermissionEnum.TAG_UPDATE,
        PermissionEnum.TAG_DELETE,
        PermissionEnum.PAGE_CREATE,
        PermissionEnum.PAGE_READ,
        PermissionEnum.PAGE_UPDATE,
        PermissionEnum.PAGE_DELETE,
        PermissionEnum.FAQ_CREATE,
        PermissionEnum.FAQ_READ,
        PermissionEnum.FAQ_UPDATE,
        PermissionEnum.FAQ_DELETE,
        PermissionEnum.POPUP_CREATE,
        PermissionEnum.POPUP_READ,
        PermissionEnum.POPUP_UPDATE,
        PermissionEnum.POPUP_DELETE,
        PermissionEnum.CUSTOMER_READ,
        PermissionEnum.REVIEW_READ,
        PermissionEnum.REVIEW_UPDATE,
        PermissionEnum.REVIEW_DELETE,
        PermissionEnum.UPLOAD_FILE,
        PermissionEnum.SETTING_CREATE,
        PermissionEnum.SETTING_READ,
        PermissionEnum.SETTING_UPDATE,
        PermissionEnum.SETTING_DELETE,
        PermissionEnum.ORDER_READ,
        PermissionEnum.USER_READ_PROFILE,
      ];

      for (const key of marketingPermissionKeys) {
        const permission = await em.findOne(Permission, { key });
        if (permission) {
          const exists = await em.findOne(RolePermission, {
            role: marketingRole,
            permission,
          });
          if (!exists) {
            const rolePermission = em.create(RolePermission, {
              role: marketingRole,
              permission,
              created_at: new Date(),
              updated_at: new Date(),
            });
            em.persist(rolePermission);
          }
        }
      }
    }

    // Product Manager role
    console.log('Assigning permissions to Product Manager role...');
    const productManagerRole = await em.findOne(Role, {
      key: RoleEnum.PRODUCT_MANAGER,
    });
    if (productManagerRole) {
      const productManagerPermissionKeys = [
        PermissionEnum.PRODUCT_CREATE,
        PermissionEnum.PRODUCT_READ,
        PermissionEnum.PRODUCT_UPDATE,
        PermissionEnum.PRODUCT_DELETE,
        PermissionEnum.CATEGORY_CREATE,
        PermissionEnum.CATEGORY_READ,
        PermissionEnum.CATEGORY_UPDATE,
        PermissionEnum.CATEGORY_DELETE,
        PermissionEnum.ORDER_CREATE,
        PermissionEnum.ORDER_READ,
        PermissionEnum.ORDER_UPDATE,
        PermissionEnum.ORDER_DELETE,
        PermissionEnum.UPLOAD_FILE,
        PermissionEnum.REVIEW_READ,
        PermissionEnum.USER_READ_PROFILE,
      ];

      for (const key of productManagerPermissionKeys) {
        const permission = await em.findOne(Permission, { key });
        if (permission) {
          const exists = await em.findOne(RolePermission, {
            role: productManagerRole,
            permission,
          });
          if (!exists) {
            const rolePermission = em.create(RolePermission, {
              role: productManagerRole,
              permission,
              created_at: new Date(),
              updated_at: new Date(),
            });
            em.persist(rolePermission);
          }
        }
      }
    }

    // Member role
    console.log('Assigning permissions to Member role...');
    if (memberRole) {
         const memberPermissions = [
            PermissionEnum.USER_READ_PROFILE,
         ];

         for (const key of memberPermissions) {
            const permission = await em.findOne(Permission, { key });
            if (permission) {
               const exists = await em.findOne(RolePermission, { role: memberRole, permission });
               if (!exists) {
                  const rp = em.create(RolePermission, {
                     role: memberRole,
                     permission,
                     created_at: new Date(),
                     updated_at: new Date(),
                  });
                  em.persist(rp);
               }
            }
         }
    }

    // User gets read-only permissions for public resources if needed, or specific customer permissions
    // Assuming User role is primarily for end-customers who might not have dashboard access via this RBAC
    // But if they do, typically it's limited.
    console.log('Assigning permissions to User role...');
    if (userRole) {
         // Minimal permissions for standard users
         const userPermissions = [
            PermissionEnum.USER_READ_PROFILE,
         ];

         for (const key of userPermissions) {
            const permission = await em.findOne(Permission, { key });
            if (permission) {
               const exists = await em.findOne(RolePermission, { role: userRole, permission });
               if (!exists) {
                  const rp = em.create(RolePermission, {
                     role: userRole,
                     permission,
                     created_at: new Date(),
                     updated_at: new Date(),
                  });
                  em.persist(rp);
               }
            }
         }
    }

    await em.flush();
    console.log('✓ Role-Permission assignments completed');
  }
}
