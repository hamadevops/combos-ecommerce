// product-category.entity.ts
import { Entity, ManyToOne, PrimaryKeyProp, Property } from '@mikro-orm/core';
import { Product } from './product.entity';
import { Category } from './category.entity';

@Entity({ tableName: 'product_categories' })
export class ProductCategory {
  @ManyToOne(() => Product, { primary: true })
  product!: Product;

  @ManyToOne(() => Category, { primary: true })
  category!: Category;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onUpdate: () => new Date() })
  updatedAt!: Date;

  [PrimaryKeyProp]?: ['product', 'category'];
}
