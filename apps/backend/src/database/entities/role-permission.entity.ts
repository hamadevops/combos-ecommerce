// src/entities/RolePermission.ts
import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { Role } from './role.entity';
import { Permission } from './permission.entity';

@Entity({ tableName: 'role_permissions' })
export class RolePermission {
  @ManyToOne(() => Role, { primary: true })
  role!: Role;

  @ManyToOne(() => Permission, { primary: true })
  permission!: Permission;

  @Property({ onCreate: () => new Date() })
  created_at: Date = new Date();

  @Property({ onUpdate: () => new Date(), onCreate: () => new Date() })
  updated_at: Date = new Date();
}
