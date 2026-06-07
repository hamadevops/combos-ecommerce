import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'app_feedbacks' })
export class AppFeedback {
  @PrimaryKey()
  id!: number;

  @Property({ length: 255, nullable: true })
  customerName?: string;

  @Property({ length: 255, nullable: true })
  customerAvatar?: string;

  @Property({ type: 'text', nullable: true })
  content?: string;

  @Property({ default: 5 })
  rating: number = 5;

  @Property({ length: 500, nullable: true })
  image?: string; // feedback screenshot/image

  @Property({ default: true })
  isActive: boolean = true;

  @Property({ default: 0 })
  sortOrder: number = 0;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
