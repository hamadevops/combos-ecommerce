import {
  Entity,
  PrimaryKey,
  Property,
  ManyToMany,
  Collection,
} from '@mikro-orm/core';
import { EmContact } from './em-contact.entity';

@Entity({ tableName: 'em_segments' })
export class EmSegment {
  @PrimaryKey()
  id!: number;

  @Property({ length: 255 })
  name!: string;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onUpdate: () => new Date(), onCreate: () => new Date() })
  updatedAt!: Date;

  @ManyToMany(() => EmContact, (contact) => contact.segments)
  contacts = new Collection<EmContact>(this);
}
