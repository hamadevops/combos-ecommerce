// customer.entity.ts
import {
  Entity,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';

@Entity({ tableName: 'customers' })
export class Customer {
  @PrimaryKey()
  id!: number;

  @Property({ length: 255 })
  fullName!: string;

  @Property({ length: 255, nullable: true })
  email?: string;

  @Property({ length: 20, nullable: true, index: true })
  phone?: string;

  @Property({ length: 255, nullable: true })
  city?: string;

  @Property({ length: 255, nullable: true })
  district?: string;

  @Property({ length: 255, nullable: true })
  ward?: string;

  @Property({ type: 'text', nullable: true })
  address?: string;

  @Property({ default: 0 })
  totalOrders: number = 0;

  @Property({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalSpent: number = 0;

  @Property({ nullable: true })
  lastOrderAt?: Date;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onUpdate: () => new Date(), onCreate: () => new Date() })
  updatedAt!: Date;
}
