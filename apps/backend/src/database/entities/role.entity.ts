// src/entities/Role.ts
import {
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  Collection,
  ManyToOne,
} from '@mikro-orm/core';
import { RolePermission } from './role-permission.entity';
import { User } from './user.entity';

@Entity({ tableName: 'roles' })
export class Role {
  @PrimaryKey()
  id!: number;

  @Property({ length: 255, unique: true })
  name!: string;

  @Property({ length: 255, unique: true })
  key!: string;

  @Property({ length: 255, nullable: true })
  description?: string;

  @Property({ default: 1 })
  is_default: number = 1;

  @ManyToOne(() => Role, { nullable: true })
  parent?: Role;

  @OneToMany(() => RolePermission, (rp) => rp.role)
  rolePermissions = new Collection<RolePermission>(this);

  @OneToMany(() => User, (user) => user.role)
  users = new Collection<User>(this);

  @Property({ onCreate: () => new Date() })
  created_at: Date = new Date();

  @Property({ onUpdate: () => new Date(), onCreate: () => new Date() })
  updated_at: Date = new Date();
}
