// product-image.entity.ts
import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Product } from './product.entity';

@Entity({ tableName: 'product_images' })
export class ProductImage {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Product)
  product!: Product;

  @Property()
  url!: string;

  @Property({ nullable: true })
  altText?: string;

  @Property({ default: 0 })
  position: number = 0;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;
}
