// post.entity.ts
import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  ManyToMany,
  Collection,
  BeforeCreate,
  BeforeUpdate,
} from '@mikro-orm/core';
import { User } from './user.entity';
import { Topic } from './topic.entity';
import { Tag } from './tag.entity';

@Entity({ tableName: 'posts' })
export class Post {
  @PrimaryKey()
  id!: number;

  @Property({ length: 255 })
  title!: string;

  @Property({ unique: true, length: 255 })
  slug!: string;

  @Property({ length: 500, nullable: true })
  thumbnail?: string;

  @Property({ type: 'text', nullable: true })
  excerpt?: string; // Short description

  @Property({ type: 'longtext', nullable: true })
  content?: string; // Long content

  // Author
  @ManyToOne(() => User)
  author!: User;

  // Status flags
  @Property({ default: false })
  isActive: boolean = false;

  @Property({ default: false })
  isPublished: boolean = false;

  @Property({ nullable: true })
  publishedAt?: Date; // For scheduling

  // Metrics
  @Property({ default: 0 })
  viewCount: number = 0;

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

  // Many-to-many relationships
  @ManyToMany(() => Topic, (topic) => topic.posts, {
    owner: true,
    pivotTable: 'post_topics',
  })
  topics = new Collection<Topic>(this);

  @ManyToMany(() => Tag, (tag) => tag.posts, {
    owner: true,
    pivotTable: 'post_tags',
  })
  tags = new Collection<Tag>(this);

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
