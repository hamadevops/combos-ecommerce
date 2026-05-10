import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Product } from './product.entity';

@Entity({ tableName: 'reviews' })
export class Review {
  @PrimaryKey()
  id!: number;

  @Property()
  rating!: number;

  @Property({ type: 'text' })
  comment!: string;

  @ManyToOne(() => Product)
  product!: Product;

  @Property()
  reviewerName!: string;

  @Property({ nullable: true })
  reviewerAvatar?: string;

  @Property({ nullable: true })
  reviewerEmail?: string;

  @Property({ nullable: true })
  image?: string;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt?: Date = new Date();
}
