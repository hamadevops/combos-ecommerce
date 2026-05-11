import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'em_config' })
export class EmConfig {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true, length: 255 })
  key!: string;

  @Property({ type: 'text', nullable: true })
  value?: string;

  @Property({ length: 255, nullable: true })
  label?: string;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onUpdate: () => new Date(), onCreate: () => new Date() })
  updatedAt!: Date;
}
