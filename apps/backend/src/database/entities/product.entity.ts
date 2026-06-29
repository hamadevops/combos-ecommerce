// product.entity.ts
import {
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  ManyToMany,
  Collection,
} from '@mikro-orm/core';
import { ProductImage } from './product-image.entity';
import { ProductVideo } from './product-video.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductTierVariation } from './product-tier-variation.entity';
import { Category } from './category.entity';
import { Review } from './review.entity';

@Entity({ tableName: 'products' })
export class Product {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property({ unique: true })
  slug!: string;

  @Property({ nullable: true })
  sku?: string;

  @Property({ type: 'text', nullable: true })
  shortDescription?: string;

  @Property({ type: 'longtext', nullable: true })
  description?: string;

  // SEO
  @Property({ nullable: true })
  seoTitle?: string;

  @Property({ length: 500, nullable: true })
  seoDescription?: string;

  @Property({ nullable: true })
  seoKeywords?: string;

  @Property({ nullable: true })
  canonicalUrl?: string;

  @Property({ nullable: true })
  ogImage?: string;

  // Pricing
  @Property({ type: 'decimal', precision: 12, scale: 2 })
  price!: number;

  @Property({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  salePrice?: number;

  @Property({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  costPrice?: number;

  // Inventory
  @Property({ default: 0 })
  stock: number = 0;

  @Property({ default: 0 })
  isActive: number;

  @Property({ default: 0 })
  isFeatured: number = 0;

  @Property({ default: 0 })
  isRecommended: number = 0;

  // Affiliate
  @Property({ default: 'purchase' })
  productType?: string = 'purchase';

  @Property({ nullable: true })
  affiliateLink?: string;

  @Property({ nullable: true })
  publishedAt?: Date;

  @Property({ default: 0 })
  soldCount: number = 0;

  @Property({ type: 'json', nullable: true })
  specifications?: Array<{ key: string; value: string; order: number }>;

  @Property({ default: 0 })
  displayOrder: number = 0;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onUpdate: () => new Date() })
  updatedAt!: Date;

  @Property({ nullable: true })
  deletedAt?: Date;

  @OneToMany(() => ProductImage, (image) => image.product, {
    orphanRemoval: true,
    orderBy: { position: 'ASC' },
  })
  images = new Collection<ProductImage>(this);

  @OneToMany(() => ProductVideo, (video) => video.product, {
    orphanRemoval: true,
    orderBy: { displayOrder: 'ASC' },
  })
  videos = new Collection<ProductVideo>(this);

  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    orphanRemoval: true,
  })
  variants = new Collection<ProductVariant>(this);

  /**
   * Tier variations for Shopee/TikTok-style product variants
   * Tier 1: Primary classification (e.g., Color - with images)
   * Tier 2: Secondary classification (e.g., Size)
   */
  @OneToMany(() => ProductTierVariation, (tier) => tier.product, {
    orphanRemoval: true,
    orderBy: { tierIndex: 'ASC' },
  })
  tierVariations = new Collection<ProductTierVariation>(this);

  @ManyToMany(() => Category, (category) => category.products, {
    owner: true,
    pivotTable: 'product_categories',
  })
  categories = new Collection<Category>(this);

  @OneToMany(() => Review, (review) => review.product, {
    orphanRemoval: true,
    orderBy: { createdAt: 'DESC' },
  })
  reviews = new Collection<Review>(this);
}
