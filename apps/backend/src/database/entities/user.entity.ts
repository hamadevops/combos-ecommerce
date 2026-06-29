// src/entities/User.ts
import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Role } from './role.entity';

@Entity({ tableName: 'users' })
export class User {
  @PrimaryKey()
  id!: number;

  @Property({ length: 255 })
  name!: string;

  @Property({ length: 255, unique: true })
  email!: string;

  @Property({ length: 255, hidden: true })
  password!: string;

  @Property({ length: 255, nullable: true })
  avatar?: string;

  @Property({ type: 'text', nullable: true })
  bio?: string;

  @Property({ length: 255, nullable: true })
  background?: string;

  @Property({ length: 20, nullable: true })
  phone?: string;

  @ManyToOne(() => Role, { nullable: true })
  role?: Role;

  @Property({ onCreate: () => new Date() })
  created_at?: Date = new Date();

  @Property({ onUpdate: () => new Date(), onCreate: () => new Date() })
  updated_at?: Date = new Date();
}
