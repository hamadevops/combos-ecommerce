import {
  Entity,
  PrimaryKey,
  Property,
  ManyToMany,
  Collection,
} from '@mikro-orm/core';
import { EmSegment } from './em-segment.entity';

@Entity({ tableName: 'em_contacts' })
export class EmContact {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true, length: 255, index: true })
  email!: string;

  @Property({ length: 255, nullable: true })
  firstName?: string;

  @Property({ length: 255, nullable: true })
  lastName?: string;

  @Property({ length: 20, nullable: true })
  phone?: string;

  @Property({ length: 255, nullable: true })
  company?: string;

  @Property({ default: true })
  isSubscribed: boolean = true;

  @Property({ nullable: true })
  unsubscribedAt?: Date;

  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onUpdate: () => new Date(), onCreate: () => new Date() })
  updatedAt!: Date;

  @ManyToMany(() => EmSegment, (segment) => segment.contacts, {
    owner: true,
    pivotTable: 'em_contact_segments',
  })
  segments = new Collection<EmSegment>(this);
}
