// post-tag.entity.ts
import { Entity, ManyToOne, PrimaryKeyProp, Property } from '@mikro-orm/core';
import { Post } from './post.entity';
import { Tag } from './tag.entity';

@Entity({ tableName: 'post_tags' })
export class PostTag {
  @ManyToOne(() => Post, { primary: true })
  post!: Post;

  @ManyToOne(() => Tag, { primary: true })
  tag!: Tag;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onUpdate: () => new Date() })
  updatedAt!: Date;

  [PrimaryKeyProp]?: ['post', 'tag'];
}
