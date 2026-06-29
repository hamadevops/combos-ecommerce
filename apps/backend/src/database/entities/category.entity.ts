// category.entity.ts
import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
  ManyToMany,
  Collection,
  BeforeCreate,
  BeforeUpdate,
} from '@mikro-orm/core';
import { Product } from './product.entity';

@Entity({ tableName: 'categories' })
export class Category {
  @PrimaryKey()
  id!: number;

  @Property({ length: 255 })
  name!: string;

  @Property({ unique: true, length: 255 })
  slug!: string;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @Property({ length: 500, nullable: true })
  image?: string;

  // Hierarchical structure
  @ManyToOne(() => Category, { nullable: true })
  parent?: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children = new Collection<Category>(this);

  @Property({ default: true })
  isActive: boolean = true;

  @Property({ default: 0 })
  sortOrder: number = 0;

  // SEO fields
  @Property({ length: 255, nullable: true })
  metaTitle?: string;

  @Property({ type: 'text', nullable: true })
  metaDescription?: string;

  @Property({ length: 500, nullable: true })
  metaKeywords?: string;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onUpdate: () => new Date() })
  updatedAt!: Date;

  // Many-to-many relationship with products
  @ManyToMany(() => Product, (product) => product.categories)
  products = new Collection<Product>(this);

  @BeforeCreate()
  @BeforeUpdate()
  generateSlug() {
    if (this.name && !this.slug) {
      this.slug = this.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
  }
}
