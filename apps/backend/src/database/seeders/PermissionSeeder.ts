import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Permission } from '../entities/permission.entity';
import { PermissionGroup } from '../entities/permission-group.entity';
import { PermissionEnum } from '../../libs/enums/permission.enum';

export class PermissionSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const permissions = [
      // Product permissions
      {
        name: 'Create Product',
        key: PermissionEnum.PRODUCT_CREATE,
        method: 'POST',
      },
      {
        name: 'Read Product',
        key: PermissionEnum.PRODUCT_READ,
        method: 'GET',
      },
      {
        name: 'Update Product',
        key: PermissionEnum.PRODUCT_UPDATE,
        method: 'PATCH',
      },
      {
        name: 'Delete Product',
        key: PermissionEnum.PRODUCT_DELETE,
        method: 'DELETE',
      },

      // User permissions
      {
        name: 'Create User',
        key: PermissionEnum.USER_CREATE,
        method: 'POST',
      },
      {
        name: 'Read User',
        key: PermissionEnum.USER_READ,
        method: 'GET',
      },
      {
        name: 'Update User',
        key: PermissionEnum.USER_UPDATE,
        method: 'PATCH',
      },
      {
        name: 'Delete User',
        key: PermissionEnum.USER_DELETE,
        method: 'DELETE',
      },
      {
        name: 'Update User Role',
        key: PermissionEnum.USER_UPDATE_ROLE,
        method: 'PATCH',
      },
      {
        name: 'Read User Profile',
        key: PermissionEnum.USER_READ_PROFILE,
        method: 'GET',
      },

      // Role permissions
      {
        name: 'Create Role',
        key: PermissionEnum.ROLE_CREATE,
        method: 'POST',
      },
      {
        name: 'Read Role',
        key: PermissionEnum.ROLE_READ,
        method: 'GET',
      },
      {
        name: 'Update Role',
        key: PermissionEnum.ROLE_UPDATE,
        method: 'PATCH',
      },
      {
        name: 'Delete Role',
        key: PermissionEnum.ROLE_DELETE,
        method: 'DELETE',
      },

      // Permission permissions
      {
        name: 'Create Permission',
        key: PermissionEnum.PERMISSION_CREATE,
        method: 'POST',
      },
      {
        name: 'Read Permission',
        key: PermissionEnum.PERMISSION_READ,
        method: 'GET',
      },
      {
        name: 'Assign Permission',
        key: PermissionEnum.PERMISSION_ASSIGN,
        method: 'POST',
      },
      {
        name: 'Revoke Permission',
        key: PermissionEnum.PERMISSION_REVOKE,
        method: 'DELETE',
      },

      // Upload permissions
      {
        name: 'Upload File',
        key: PermissionEnum.UPLOAD_FILE,
        method: 'POST',
      },

      // Category permissions
      {
        name: 'Create Category',
        key: PermissionEnum.CATEGORY_CREATE,
        method: 'POST',
      },
      {
        name: 'Read Category',
        key: PermissionEnum.CATEGORY_READ,
        method: 'GET',
      },
      {
        name: 'Update Category',
        key: PermissionEnum.CATEGORY_UPDATE,
        method: 'PATCH',
      },
      {
        name: 'Delete Category',
        key: PermissionEnum.CATEGORY_DELETE,
        method: 'DELETE',
      },

      // Topic permissions
      {
        name: 'Create Topic',
        key: PermissionEnum.TOPIC_CREATE,
        method: 'POST',
      },
      {
        name: 'Read Topic',
        key: PermissionEnum.TOPIC_READ,
        method: 'GET',
      },
      {
        name: 'Update Topic',
        key: PermissionEnum.TOPIC_UPDATE,
        method: 'PATCH',
      },
      {
        name: 'Delete Topic',
        key: PermissionEnum.TOPIC_DELETE,
        method: 'DELETE',
      },

      // Post permissions
      {
        name: 'Create Post',
        key: PermissionEnum.POST_CREATE,
        method: 'POST',
      },
      {
        name: 'Read Post',
        key: PermissionEnum.POST_READ,
        method: 'GET',
      },
      {
        name: 'Update Post',
        key: PermissionEnum.POST_UPDATE,
        method: 'PATCH',
      },
      {
        name: 'Delete Post',
        key: PermissionEnum.POST_DELETE,
        method: 'DELETE',
      },
      {
        name: 'Publish Post',
        key: PermissionEnum.POST_PUBLISH,
        method: 'POST',
      },

      // Tag permissions
      {
        name: 'Create Tag',
        key: PermissionEnum.TAG_CREATE,
        method: 'POST',
      },
      {
        name: 'Read Tag',
        key: PermissionEnum.TAG_READ,
        method: 'GET',
      },
      {
        name: 'Update Tag',
        key: PermissionEnum.TAG_UPDATE,
        method: 'PATCH',
      },
      {
        name: 'Delete Tag',
        key: PermissionEnum.TAG_DELETE,
        method: 'DELETE',
      },

      // FAQ permissions
      {
        name: 'Create FAQ',
        key: PermissionEnum.FAQ_CREATE,
        method: 'POST',
      },
      {
        name: 'Read FAQ',
        key: PermissionEnum.FAQ_READ,
        method: 'GET',
      },
      {
        name: 'Update FAQ',
        key: PermissionEnum.FAQ_UPDATE,
        method: 'PATCH',
      },
      {
        name: 'Delete FAQ',
        key: PermissionEnum.FAQ_DELETE,
        method: 'DELETE',
      },

      // Page permissions
      {
        name: 'Create Page',
        key: PermissionEnum.PAGE_CREATE,
        method: 'POST',
      },
      {
        name: 'Read Page',
        key: PermissionEnum.PAGE_READ,
        method: 'GET',
      },
      {
        name: 'Update Page',
        key: PermissionEnum.PAGE_UPDATE,
        method: 'PATCH',
      },
      {
        name: 'Delete Page',
        key: PermissionEnum.PAGE_DELETE,
        method: 'DELETE',
      },

      // Setting permissions
      {
        name: 'Create Setting',
        key: PermissionEnum.SETTING_CREATE,
        method: 'POST',
      },
      {
        name: 'Read Setting',
        key: PermissionEnum.SETTING_READ,
        method: 'GET',
      },
      {
        name: 'Update Setting',
        key: PermissionEnum.SETTING_UPDATE,
        method: 'PATCH',
      },
      {
        name: 'Delete Setting',
        key: PermissionEnum.SETTING_DELETE,
        method: 'DELETE',
      },

      // Cache permissions
      {
        name: 'Manage Cache',
        key: PermissionEnum.CACHE_MANAGE,
        method: 'GET', // Primarily GET for viewing, but it's a general permission
      },
      // Review permissions
      {
        name: 'Create Review',
        key: PermissionEnum.REVIEW_CREATE,
        method: 'POST',
      },
      {
        name: 'Read Review',
        key: PermissionEnum.REVIEW_READ,
        method: 'GET',
      },
      {
        name: 'Update Review',
        key: PermissionEnum.REVIEW_UPDATE,
        method: 'PATCH',
      },
      {
        name: 'Delete Review',
        key: PermissionEnum.REVIEW_DELETE,
        method: 'DELETE',
      },

      // Popup permissions
      {
        name: 'Create Popup',
        key: PermissionEnum.POPUP_CREATE,
        method: 'POST',
      },
      {
        name: 'Read Popup',
        key: PermissionEnum.POPUP_READ,
        method: 'GET',
      },
      {
        name: 'Update Popup',
        key: PermissionEnum.POPUP_UPDATE,
        method: 'PATCH',
      },
      {
        name: 'Delete Popup',
        key: PermissionEnum.POPUP_DELETE,
        method: 'DELETE',
      },
      // Order permissions
      {
        name: 'Create Order',
        key: PermissionEnum.ORDER_CREATE,
        method: 'POST',
      },
      {
        name: 'Read Order',
        key: PermissionEnum.ORDER_READ,
        method: 'GET',
      },
      {
        name: 'Update Order',
        key: PermissionEnum.ORDER_UPDATE,
        method: 'PATCH',
      },
      {
        name: 'Delete Order',
        key: PermissionEnum.ORDER_DELETE,
        method: 'DELETE',
      },

      // Customer permissions
      {
        name: 'Create Customer',
        key: PermissionEnum.CUSTOMER_CREATE,
        method: 'POST',
      },
      {
        name: 'Read Customer',
        key: PermissionEnum.CUSTOMER_READ,
        method: 'GET',
      },
      {
        name: 'Update Customer',
        key: PermissionEnum.CUSTOMER_UPDATE,
        method: 'PATCH',
      },
      {
        name: 'Delete Customer',
        key: PermissionEnum.CUSTOMER_DELETE,
        method: 'DELETE',
      },
      // Webhook permissions
      {
        name: 'View Webhooks',
        key: PermissionEnum.WEBHOOK_READ,
        method: 'GET',
      },
      {
        name: 'Create Webhook',
        key: PermissionEnum.WEBHOOK_CREATE,
        method: 'POST',
      },
      {
        name: 'Update Webhook',
        key: PermissionEnum.WEBHOOK_UPDATE,
        method: 'PATCH',
      },
      {
        name: 'Delete Webhook',
        key: PermissionEnum.WEBHOOK_DELETE,
        method: 'DELETE',
      },
    ];

    for (const permData of permissions) {
      // Check if permission already exists by key (unique identifier)
      const existingPerm = await em.findOne(Permission, { key: permData.key });

      // Find the matching group based on key prefix
      const keyPrefix = permData.key.split('.')[0];
      const group = await em.findOne(PermissionGroup, { key: keyPrefix });

      if (!existingPerm) {
        const permission = em.create(Permission, {
          ...permData,
          group: group || undefined,
          created_at: new Date(),
          updated_at: new Date(),
        });
        em.persist(permission);
        console.log(`✓ Created permission: ${permData.name} (group: ${group?.name || 'none'})`);
      } else {
        // Update group assignment for existing permissions
        if (group && existingPerm.group?.id !== group.id) {
          existingPerm.group = group;
          console.log(`~ Updated group for permission: ${permData.name} → ${group.name}`);
        } else {
          console.log(`- Permission already exists: ${permData.name}`);
        }
      }
    }

    await em.flush();
  }
}
