// order.entity.ts
import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
  Collection,
  Enum,
} from '@mikro-orm/core';
import { Customer } from './customer.entity';
import { OrderItem } from './order-item.entity';

export enum PaymentMethod {
  COD = 'COD',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPING = 'SHIPPING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity({ tableName: 'orders' })
export class Order {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true })
  code!: string;

  @ManyToOne(() => Customer, { nullable: true })
  customer?: Customer;

  // Snapshot fields
  @Property({ length: 255 })
  customerName!: string;

  @Property({ length: 255, nullable: true })
  customerEmail?: string;

  @Property({ length: 20, nullable: true })
  customerPhone?: string;

  // Shipping info
  @Property({ type: 'text', nullable: true })
  shippingAddress?: string;

  @Property({ length: 255, nullable: true })
  shippingCity?: string;

  @Property({ length: 255, nullable: true })
  shippingDistrict?: string;

  @Property({ length: 255, nullable: true })
  shippingWard?: string;

  @Property({ type: 'text', nullable: true })
  notes?: string;

  // Amounts
  @Property({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalAmount: number = 0;

  @Property({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  shippingFee: number = 0;

  @Property({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  discountAmount: number = 0;

  @Property({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  finalAmount: number = 0;

  // Payment & Status
  @Enum(() => PaymentMethod)
  paymentMethod: PaymentMethod = PaymentMethod.COD;

  @Enum(() => PaymentStatus)
  paymentStatus: PaymentStatus = PaymentStatus.PENDING;

  @Enum(() => OrderStatus)
  status: OrderStatus = OrderStatus.PENDING;

  // Tracking & Marketing
  @Property({ length: 255, nullable: true })
  utmSource?: string;

  @Property({ length: 255, nullable: true })
  utmMedium?: string;

  @Property({ length: 255, nullable: true })
  utmCampaign?: string;

  @Property({ length: 255, nullable: true })
  utmTerm?: string;

  @Property({ length: 255, nullable: true })
  utmContent?: string;

  @Property({ length: 255, nullable: true })
  marketingPlatform?: string;

  @Property({ length: 255, nullable: true })
  marketingPlatformId?: string;

  @OneToMany(() => OrderItem, (item) => item.order, {
    orphanRemoval: true,
  })
  items = new Collection<OrderItem>(this);

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onUpdate: () => new Date(), onCreate: () => new Date() })
  updatedAt!: Date;
}
