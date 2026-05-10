import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'faqs' })
export class Faq {
  @PrimaryKey()
  id!: number;

  @Property({ type: 'text' })
  question!: string;

  @Property({ type: 'text' })
  answer!: string;

  @Property({ default: 0 })
  sortOrder: number = 0;

  @Property({ default: true })
  isActive: boolean = true;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onUpdate: () => new Date() })
  updatedAt!: Date;
}
