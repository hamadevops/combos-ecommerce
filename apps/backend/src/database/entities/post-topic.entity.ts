// post-topic.entity.ts
import { Entity, ManyToOne, PrimaryKeyProp, Property } from '@mikro-orm/core';
import { Post } from './post.entity';
import { Topic } from './topic.entity';

@Entity({ tableName: 'post_topics' })
export class PostTopic {
  @ManyToOne(() => Post, { primary: true })
  post!: Post;

  @ManyToOne(() => Topic, { primary: true })
  topic!: Topic;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onUpdate: () => new Date() })
  updatedAt!: Date;

  [PrimaryKeyProp]?: ['post', 'topic'];
}
