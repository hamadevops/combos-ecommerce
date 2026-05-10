// order-item.entity.ts
import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
} from '@mikro-orm/core';
import { Order } from './order.entity';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';

@Entity({ tableName: 'order_items' })
export class OrderItem {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Order, { deleteRule: 'cascade' })
  order!: Order;

  @ManyToOne(() => Product, { nullable: true })
  product?: Product;

  @ManyToOne(() => ProductVariant, { nullable: true })
  productVariant?: ProductVariant;

  // Snapshot fields
  @Property({ length: 255 })
  productName!: string;

  @Property({ length: 255, nullable: true })
  variantName?: string;

  @Property({ type: 'json', nullable: true })
  variantOptions?: Array<{ name: string; value: string }>;

  @Property({ length: 100, nullable: true })
  sku?: string;

  @Property({ length: 500, nullable: true })
  thumbnail?: string;

  @Property()
  quantity!: number;

  @Property({ type: 'decimal', precision: 15, scale: 2 })
  price!: number;

  @Property({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  costPrice?: number;

  @Property({ type: 'decimal', precision: 15, scale: 2 })
  total!: number;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;
}
