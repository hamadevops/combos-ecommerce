// topic.entity.ts
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
import { Post } from './post.entity';
import { BadRequestException } from '@nestjs/common';

@Entity({ tableName: 'topics' })
export class Topic {
  @PrimaryKey()
  id!: number;

  @Property({ length: 255 })
  name!: string;

  @Property({ unique: true, length: 255 })
  slug!: string;

  @Property({ type: 'text', nullable: true })
  description?: string;

  // Hierarchical structure
  @ManyToOne(() => Topic, { nullable: true })
  parent?: Topic;

  @OneToMany(() => Topic, (topic) => topic.parent)
  children = new Collection<Topic>(this);

  @Property()
  level: number = 0; // 0, 1, or 2 (max 3 levels)

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

  // Many-to-many relationship with posts
  @ManyToMany(() => Post, (post) => post.topics)
  posts = new Collection<Post>(this);

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

  @BeforeCreate()
  @BeforeUpdate()
  validateLevel() {
    if (this.level > 2) {
      throw new BadRequestException('Topics are limited to 3 levels (0, 1, 2)');
    }
  }
}
