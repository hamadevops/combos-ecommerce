// src/entities/Permission.ts
import {
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  ManyToOne,
  Collection,
} from '@mikro-orm/core';
import { RolePermission } from './role-permission.entity';
import { PermissionGroup } from './permission-group.entity';

@Entity({ tableName: 'permissions' })
export class Permission {
  @PrimaryKey()
  id!: number;

  @Property({ length: 255 })
  name!: string;

  @Property({ length: 255 })
  key!: string;

  @Property({ length: 16, nullable: true })
  method?: string;

  @ManyToOne(() => PermissionGroup, { nullable: true })
  group?: PermissionGroup;

  @OneToMany(() => RolePermission, (rp) => rp.permission)
  rolePermissions = new Collection<RolePermission>(this);

  @Property({ onCreate: () => new Date() })
  created_at: Date = new Date();

  @Property({ onUpdate: () => new Date(), onCreate: () => new Date() })
  updated_at: Date = new Date();
}
