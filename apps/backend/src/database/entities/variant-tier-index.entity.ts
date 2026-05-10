// variant-tier-index.entity.ts
import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Unique,
} from '@mikro-orm/core';
import { ProductVariant } from './product-variant.entity';
import { TierOption } from './tier-option.entity';

/**
 * VariantTierIndex - Bảng trung gian liên kết ProductVariant với TierOption
 * 
 * Mỗi variant có thể liên kết với 1 hoặc 2 tier options
 * Ví dụ: Variant "Đỏ - XL" sẽ có 2 records:
 *   - tierIndex=0, tierOption="Đỏ"
 *   - tierIndex=1, tierOption="XL"
 */
@Entity({ tableName: 'variant_tier_indexes' })
@Unique({ properties: ['variant', 'tierIndex'] })
export class VariantTierIndex {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => ProductVariant, { deleteRule: 'cascade' })
  variant!: ProductVariant;

  @ManyToOne(() => TierOption, { deleteRule: 'cascade' })
  tierOption!: TierOption;

  /**
   * Index của tier (0 = tier1, 1 = tier2)
   * Dùng để xác định option này thuộc tier nào
   */
  @Property({ type: 'tinyint' })
  tierIndex!: number;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;
}
