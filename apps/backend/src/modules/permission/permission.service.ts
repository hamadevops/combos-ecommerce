/*
src/modules/permission/permission.service.ts
*/

import { EntityManager } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import { RoleCreateDto } from './dto/role-create.dto';
import { Role } from 'src/database/entities/role.entity';
import { CustomBadRequestException } from 'src/common/exceptions/custom-exceptions';
import { RolePermission } from 'src/database/entities/role-permission.entity';
import { CreatePermissionDto } from './dto/permission-create.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from 'src/database/entities/permission.entity';
import { PermissionGroup } from 'src/database/entities/permission-group.entity';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { RoleQueryDto } from './dto/role-query.dto';
import { PermissionQueryDto } from './dto/permission-query.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { User } from 'src/database/entities/user.entity';
import { CreatePermissionGroupDto } from './dto/permission-group-create.dto';
import { UpdatePermissionGroupDto } from './dto/permission-group-update.dto';
import { AssignPermissionsToGroupDto } from './dto/assign-permissions-to-group.dto';

@Injectable()
export class PermissionService {
  constructor(private readonly em: EntityManager) {}

  async allRoles(query: RoleQueryDto) {
    const { page = 1, perPage = 20, search } = query;

    const offset = (page - 1) * perPage;

    const where: Record<string, any> = {};

    if (search) {
      where.$or = [
        { name: { $like: `%${search}%` } },
        { key: { $like: `%${search}%` } },
      ];
    }

    const [items, total] = await this.em.findAndCount(
      Role,
      where,
      {
        limit: perPage,
        offset,
        orderBy: { created_at: 'DESC' },
        populate: ['rolePermissions'],
      },
    );

    return {
      items,
      meta: {
        page,
        perPage,
        total,
        totalPage: Math.ceil(total / perPage),
      },
    };
  }

  async detailRole(id: number) {
    const role = await this.em.findOne(
      Role,
      { id },
      {
        populate: ['rolePermissions.permission', 'parent'],
      },
    );
    return role;
  }

  async create(data: RoleCreateDto) {
    return this.em.transactional(async (em) => {
      const exitsRole = await em.findOne(Role, {
        key: data.key,
        name: data.name,
      });

      if (exitsRole) {
        throw new CustomBadRequestException('Role already exists');
      }

      const parent = data.parent_id
        ? await em.findOne(
            Role,
            { id: data.parent_id },
            {
              populate: ['rolePermissions.permission'],
            },
          )
        : null;

      const role = em.create(Role, {
        name: data.name,
        key: data.key,
        parent,
        description: data.description,
        is_default: 1,
        created_at: new Date(),
        updated_at: new Date(),
      });

      em.persist(role);

      if (data.permission_ids && data.permission_ids.length > 0) {
        // If specific permissions are provided, use them
        for (const permissionId of data.permission_ids) {
          const permission = await em.findOne(Permission, {
            id: permissionId,
          });
          if (permission) {
            em.create(RolePermission, {
              role,
              permission,
              created_at: new Date(),
              updated_at: new Date(),
            });
          }
        }
      } else if (parent) {
        // Fallback: inherit from parent
        const permissions = parent.rolePermissions
          .getItems()
          .map((rp) => rp.permission);

        for (const permission of permissions) {
          em.create(RolePermission, {
            role,
            permission,
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      }

      await em.flush();
      return role;
    });
  }

  async updateRole(id: number, data: UpdateRoleDto) {
    return this.em.transactional(async (em) => {
      const role = await em.findOne(Role, { id });
      if (!role) {
        throw new CustomBadRequestException('Role not found');
      }

      // Check if new key/name conflicts with existing roles
      if (data.key || data.name) {
        const conflictRole = await em.findOne(Role, {
          $or: [
            ...(data.key ? [{ key: data.key }] : []),
            ...(data.name ? [{ name: data.name }] : []),
          ],
          id: { $ne: id },
        });

        if (conflictRole) {
          throw new CustomBadRequestException(
            'Role with this key or name already exists',
          );
        }
      }

      // Update fields
      if (data.name) role.name = data.name;
      if (data.key) role.key = data.key;
      if (data.is_default !== undefined) role.is_default = data.is_default;

      // Update parent if specified
      if (data.parent_id !== undefined) {
        if (data.parent_id === null) {
          role.parent = undefined;
        } else {
          const parent = await em.findOne(Role, { id: data.parent_id });
          if (!parent) {
            throw new CustomBadRequestException('Parent role not found');
          }
          role.parent = parent;
        }
      }

      // Update description
      if (data.description !== undefined) {
        role.description = data.description;
      }

      // Sync permissions if provided
      if (data.permission_ids !== undefined) {
          // Remove existing permissions
          await em.nativeDelete(RolePermission, { role });

          // Add new permissions
          for (const permissionId of data.permission_ids) {
            const permission = await em.findOne(Permission, {
              id: permissionId,
            });
            if (permission) {
              const rolePermission = em.create(RolePermission, {
                role,
                permission,
                created_at: new Date(),
                updated_at: new Date(),
              });
              em.persist(rolePermission);
            }
          }
      }

      role.updated_at = new Date();
      await em.flush();
      return role;
    });
  }

  async deleteRole(id: number) {
    return this.em.transactional(async (em) => {
      const role = await em.findOne(Role, { id }, { populate: ['users'] });
      if (!role) {
        throw new CustomBadRequestException('Role not found');
      }

      // Check if role has users
      const userCount = await em.count(User, { role });
      if (userCount > 0) {
        throw new CustomBadRequestException(
          'Cannot delete role that has assigned users',
        );
      }

      // Delete role permissions first
      await em.nativeDelete(RolePermission, { role });

      // Delete the role
      await em.removeAndFlush(role);
      return { message: 'Role deleted successfully' };
    });
  }

  async createPermission(data: CreatePermissionDto) {
    return this.em.transactional(async (em) => {
      const permission = await em.findOne(Permission, {
        key: data.key,
      });
      if (permission) {
        throw new CustomBadRequestException('Permission already exists');
      }

      let group: PermissionGroup | null = null;
      if (data.group_id) {
        group = await em.findOne(PermissionGroup, { id: data.group_id });
        if (!group) {
          throw new CustomBadRequestException('Permission group not found');
        }
      }

      const newPermission = em.create(Permission, {
        name: data.name,
        key: data.key,
        method: data.method,
        group: group || undefined,
        created_at: new Date(),
        updated_at: new Date(),
      });
      em.persist(newPermission);
      await em.flush();
      return newPermission;
    });
  }

  async updatePermission(id: number, data: UpdatePermissionDto) {
    return this.em.transactional(async (em) => {
      const permission = await em.findOne(Permission, { id });
      if (!permission) {
        throw new CustomBadRequestException('Permission not found');
      }

      // Check key uniqueness if key is being updated
      if (data.key) {
        const conflict = await em.findOne(Permission, {
          key: data.key,
          id: { $ne: id },
        });
        if (conflict) {
          throw new CustomBadRequestException(
            'Permission with this key already exists',
          );
        }
        permission.key = data.key;
      }

      if (data.name !== undefined) permission.name = data.name;
      if (data.method !== undefined) permission.method = data.method;

      // Handle group reassignment
      if (data.group_id !== undefined) {
        if (data.group_id === null) {
          permission.group = undefined;
        } else {
          const group = await em.findOne(PermissionGroup, { id: data.group_id });
          if (!group) {
            throw new CustomBadRequestException('Permission group not found');
          }
          permission.group = group;
        }
      }

      permission.updated_at = new Date();
      await em.flush();
      return permission;
    });
  }

  async deletePermission(id: number) {
    return this.em.transactional(async (em) => {
      const permission = await em.findOne(Permission, { id });
      if (!permission) {
        throw new CustomBadRequestException('Permission not found');
      }

      // Remove all role-permission associations first
      await em.nativeDelete(RolePermission, { permission });

      // Delete the permission
      await em.removeAndFlush(permission);
      return { message: 'Permission deleted successfully' };
    });
  }

  async getAllPermissions(query: PermissionQueryDto) {
    const { page = 1, perPage = 1000, search, method } = query;
    const offset = (page - 1) * perPage;

    const where: Record<string, any> = {};

    if (search) {
      where.$or = [
        { name: { $like: `%${search}%` } },
        { key: { $like: `%${search}%` } },
      ];
    }

    if (method) {
      where.method = method;
    }

    const [items, total] = await this.em.findAndCount(Permission, where, {
      orderBy: { created_at: 'DESC' },
      populate: ['group'],
    });

    return {
      items,
      meta: {
        page: 1,
        perPage: total,
        total,
        totalPage: 1,
      },
    };
  }

  async assignPermission(roleId: number, data: AssignPermissionDto) {
    return this.em.transactional(async (em) => {
      const role = await em.findOne(Role, { id: roleId });
      if (!role) {
        throw new CustomBadRequestException('Role not found');
      }

      for (const permissionId of data.permissionIds) {
        const permission = await em.findOne(Permission, {
          id: permissionId,
        });
        if (!permission) {
          throw new CustomBadRequestException(
            `Permission with id ${permissionId} not found`,
          );
        }

        const existsRolePermission = await em.findOne(RolePermission, {
          role,
          permission,
        });

        if (!existsRolePermission) {
          const rolePermission = em.create(RolePermission, {
            role,
            permission,
            created_at: new Date(),
            updated_at: new Date(),
          });
          em.persist(rolePermission);
        }
      }

      await em.flush();
      return role;
    });
  }

  async removePermissionFromRole(roleId: number, permissionId: number) {
    return this.em.transactional(async (em) => {
      const role = await em.findOne(Role, { id: roleId });
      if (!role) {
        throw new CustomBadRequestException('Role not found');
      }

      const permission = await em.findOne(Permission, { id: permissionId });
      if (!permission) {
        throw new CustomBadRequestException('Permission not found');
      }

      const rolePermission = await em.findOne(RolePermission, {
        role,
        permission,
      });

      if (!rolePermission) {
        throw new CustomBadRequestException(
          'Permission not assigned to this role',
        );
      }

      await em.removeAndFlush(rolePermission);
      return { message: 'Permission removed from role successfully' };
    });
  }

  async getUserPermissions(userId: number) {
    const user = await this.em.findOne(
      User,
      { id: userId },
      {
        populate: [
          'role',
          'role.rolePermissions',
          'role.rolePermissions.permission',
        ],
      },
    );

    if (!user) {
      throw new CustomBadRequestException('User not found');
    }

    if (!user.role) {
      return { permissions: [] };
    }

    const permissions = user.role.rolePermissions
      .getItems()
      .map((rp) => rp.permission);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      role: {
        id: user.role.id,
        name: user.role.name,
        key: user.role.key,
      },
      permissions,
    };
  }

  // ========= Permission Group Methods =========

  async getAllPermissionGroups() {
    const groups = await this.em.find(
      PermissionGroup,
      {},
      { orderBy: { display_order: 'ASC' } },
    );
    return { items: groups };
  }

  async createPermissionGroup(data: CreatePermissionGroupDto) {
    return this.em.transactional(async (em) => {
      const existing = await em.findOne(PermissionGroup, { key: data.key });
      if (existing) {
        throw new CustomBadRequestException('Permission group already exists');
      }

      const group = em.create(PermissionGroup, {
        name: data.name,
        key: data.key,
        display_order: data.display_order ?? 0,
        created_at: new Date(),
        updated_at: new Date(),
      });
      em.persist(group);
      await em.flush();
      return group;
    });
  }

  async updatePermissionGroup(id: number, data: UpdatePermissionGroupDto) {
    return this.em.transactional(async (em) => {
      const group = await em.findOne(PermissionGroup, { id });
      if (!group) {
        throw new CustomBadRequestException('Permission group not found');
      }

      if (data.key) {
        const conflict = await em.findOne(PermissionGroup, {
          key: data.key,
          id: { $ne: id },
        });
        if (conflict) {
          throw new CustomBadRequestException('Permission group key already exists');
        }
        group.key = data.key;
      }

      if (data.name !== undefined) group.name = data.name;
      if (data.display_order !== undefined) group.display_order = data.display_order;

      group.updated_at = new Date();
      await em.flush();
      return group;
    });
  }

  async deletePermissionGroup(id: number) {
    return this.em.transactional(async (em) => {
      const group = await em.findOne(PermissionGroup, { id });
      if (!group) {
        throw new CustomBadRequestException('Permission group not found');
      }

      // Unlink permissions from this group (set group_id to null)
      const permissions = await em.find(Permission, { group: { id } });
      for (const p of permissions) {
        p.group = undefined;
      }

      await em.removeAndFlush(group);
      return { message: 'Permission group deleted successfully' };
    });
  }

  async assignPermissionsToGroup(groupId: number, data: AssignPermissionsToGroupDto) {
    return this.em.transactional(async (em) => {
      const group = await em.findOne(PermissionGroup, { id: groupId });
      if (!group) {
        throw new CustomBadRequestException('Permission group not found');
      }

      for (const permissionId of data.permission_ids) {
        const permission = await em.findOne(Permission, { id: permissionId });
        if (!permission) {
          throw new CustomBadRequestException(
            `Permission with id ${permissionId} not found`,
          );
        }
        permission.group = group;
      }

      await em.flush();
      return group;
    });
  }

  async removePermissionsFromGroup(groupId: number, data: AssignPermissionsToGroupDto) {
    return this.em.transactional(async (em) => {
      const group = await em.findOne(PermissionGroup, { id: groupId });
      if (!group) {
        throw new CustomBadRequestException('Permission group not found');
      }

      for (const permissionId of data.permission_ids) {
        const permission = await em.findOne(Permission, {
          id: permissionId,
          group: { id: groupId },
        });
        if (permission) {
          permission.group = undefined;
        }
      }

      await em.flush();
      return { message: 'Permissions removed from group successfully' };
    });
  }

  async getGroupedPermissions() {
    const groups = await this.em.find(
      PermissionGroup,
      {},
      {
        orderBy: { display_order: 'ASC' },
        populate: ['permissions'],
      },
    );

    // Also find ungrouped permissions
    const ungrouped = await this.em.find(Permission, { group: null });

    const result = groups.map((g) => ({
      id: g.id,
      key: g.key,
      name: g.name,
      display_order: g.display_order,
      permissions: g.permissions.getItems().map((p) => ({
        id: p.id,
        key: p.key,
        name: p.name,
        method: p.method,
      })),
    }));

    if (ungrouped.length > 0) {
      result.push({
        id: 0,
        key: 'other',
        name: 'Khác',
        display_order: 999,
        permissions: ungrouped.map((p) => ({
          id: p.id,
          key: p.key,
          name: p.name,
          method: p.method,
        })),
      });
    }

    return { data: result };
  }
}
