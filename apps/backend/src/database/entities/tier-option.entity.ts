// tier-option.entity.ts
import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
  Collection,
} from '@mikro-orm/core';
import { ProductTierVariation } from './product-tier-variation.entity';
import { VariantTierIndex } from './variant-tier-index.entity';

/**
 * TierOption - Đại diện cho một option trong tier variation
 * Ví dụ: Nếu tier là "Màu sắc" thì options có thể là "Đỏ", "Xanh", "Vàng"
 * 
 * Đối với tier 1 (tier chính), mỗi option có thể có ảnh đi kèm
 * Ví dụ: Option "Đỏ" có ảnh sản phẩm màu đỏ
 */
@Entity({ tableName: 'tier_options' })
export class TierOption {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => ProductTierVariation, { deleteRule: 'cascade' })
  tierVariation!: ProductTierVariation;

  /**
   * Giá trị của option
   * Ví dụ: "Đỏ", "XL", "256GB"
   */
  @Property()
  value!: string;

  /**
   * URL ảnh đại diện cho option này (chỉ dùng cho tier 1)
   * Mỗi màu sắc có thể có ảnh sản phẩm riêng
   */
  @Property({ nullable: true })
  imageUrl?: string;

  /**
   * Thứ tự hiển thị
   */
  @Property({ default: 0 })
  position: number = 0;

  /**
   * Trạng thái kích hoạt
   */
  @Property({ type: 'tinyint', default: 1 })
  isActive: number = 1;

  /**
   * Liên kết với các variant thông qua VariantTierIndex
   */
  @OneToMany(() => VariantTierIndex, (vti) => vti.tierOption)
  variantIndexes = new Collection<VariantTierIndex>(this);

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onUpdate: () => new Date() })
  updatedAt!: Date;
}
