// tag.entity.ts
import {
  Entity,
  PrimaryKey,
  Property,
  ManyToMany,
  Collection,
  BeforeCreate,
  BeforeUpdate,
} from '@mikro-orm/core';
import { Post } from './post.entity';

@Entity({ tableName: 'tags' })
export class Tag {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true, length: 100 })
  name!: string;

  @Property({ unique: true, length: 100 })
  slug!: string;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onUpdate: () => new Date() })
  updatedAt!: Date;

  // Many-to-many relationship with posts
  @ManyToMany(() => Post, (post) => post.tags)
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
}
