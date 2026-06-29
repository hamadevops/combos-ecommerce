import {
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  Collection,
} from '@mikro-orm/core';
import { Permission } from './permission.entity';

@Entity({ tableName: 'permission_groups' })
export class PermissionGroup {
  @PrimaryKey()
  id!: number;

  @Property({ length: 255 })
  name!: string;

  @Property({ length: 255, unique: true })
  key!: string;

  @Property({ default: 0 })
  display_order: number = 0;

  @OneToMany(() => Permission, (p) => p.group)
  permissions = new Collection<Permission>(this);

  @Property({ onCreate: () => new Date() })
  created_at: Date = new Date();

  @Property({ onUpdate: () => new Date(), onCreate: () => new Date() })
  updated_at: Date = new Date();
}
