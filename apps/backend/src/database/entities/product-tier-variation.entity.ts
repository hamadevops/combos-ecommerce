// product-tier-variation.entity.ts
import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
  Collection,
  Cascade,
} from '@mikro-orm/core';
import { Product } from './product.entity';
import { TierOption } from './tier-option.entity';

/**
 * ProductTierVariation - Đại diện cho một "phân loại hàng" của sản phẩm
 * Ví dụ: "Màu sắc", "Kích thước", "Phiên bản"
 * 
 * Một sản phẩm có thể có 0, 1 hoặc 2 tier variations:
 * - 0 tier: Sản phẩm đơn giản (simple product)
 * - 1 tier: Chỉ có 1 phân loại (ví dụ: chỉ có Size)
 * - 2 tier: Có 2 phân loại (ví dụ: Màu sắc + Size)
 */
@Entity({ tableName: 'product_tier_variations' })
export class ProductTierVariation {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Product, { deleteRule: 'cascade' })
  product!: Product;

  /**
   * Tên của tier variation
   * Ví dụ: "Màu sắc", "Kích thước", "Dung lượng"
   */
  @Property()
  name!: string;

  /**
   * Index của tier (0 = tier1, 1 = tier2)
   * Tier 1 là phân loại chính (thường có ảnh đi kèm)
   * Tier 2 là phân loại phụ
   */
  @Property({ type: 'tinyint', default: 0 })
  tierIndex: number = 0;

  /**
   * Thứ tự hiển thị
   */
  @Property({ default: 0 })
  position: number = 0;

  /**
   * Các option thuộc tier này
   */
  @OneToMany(() => TierOption, (option) => option.tierVariation, {
    orphanRemoval: true,
    orderBy: { position: 'ASC' },
  })
  options = new Collection<TierOption>(this);

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onUpdate: () => new Date() })
  updatedAt!: Date;
}
