import {
  Entity,
  PrimaryKey,
  Property,
  BeforeCreate,
  BeforeUpdate,
} from '@mikro-orm/core';

@Entity({ tableName: 'pages' })
export class Page {
  @PrimaryKey()
  id!: number;

  @Property({ length: 255 })
  title!: string;

  @Property({ unique: true, length: 255 })
  slug!: string;

  @Property({ type: 'longtext', nullable: true })
  content?: string;

  @Property({ default: true })
  isActive: boolean = true;

  @Property({ default: 'standard' })
  type: string = 'standard'; // standard, system (e.g., policy pages that shouldn't be deleted)

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

  @BeforeCreate()
  @BeforeUpdate()
  generateSlug() {
    if (this.title && !this.slug) {
      this.slug = this.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
  }
}
