// product-variant.entity.ts
import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  ManyToMany,
  OneToMany,
  Collection,
} from '@mikro-orm/core';
import { Product } from './product.entity';

import { VariantTierIndex } from './variant-tier-index.entity';

@Entity({ tableName: 'product_variants' })
export class ProductVariant {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Product, { deleteRule: 'cascade' })
  product!: Product;

  @Property({ unique: true, nullable: true })
  sku?: string;

  /**
   * Tên hiển thị của variant (auto-generated từ tier options)
   * Ví dụ: "Đỏ - XL", "Titan Đen - 256GB"
   */
  @Property({ nullable: true })
  name?: string;

  @Property()
  price!: number;

  @Property({ nullable: true })
  salePrice?: number;

  @Property({ nullable: true })
  costPrice?: number;

  @Property({ default: 0 })
  stock: number = 0;

  @Property({ default: 1 })
  isActive: number;

  @Property({ type: 'json', nullable: true })
  optionIds?: number[];

  @Property({ type: 'json', nullable: true })
  optionValues?: string[];

  @Property({ nullable: true })
  deletedAt?: Date;



  /**
   * New: Liên kết với TierOption qua VariantTierIndex
   * Cho phép variant có 1 hoặc 2 tier options
   */
  @OneToMany(() => VariantTierIndex, (vti) => vti.variant, {
    orphanRemoval: true,
  })
  tierIndexes = new Collection<VariantTierIndex>(this);

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onUpdate: () => new Date() })
  updatedAt!: Date;
}
