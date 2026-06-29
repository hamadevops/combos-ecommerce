import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'em_templates' })
export class EmTemplate {
  @PrimaryKey()
  id!: number;

  @Property({ length: 255 })
  name!: string;

  @Property({ length: 255 })
  subject!: string;

  @Property({ type: 'text', lazy: false })
  htmlContent!: string;

  @Property({ type: 'json', nullable: true })
  designData?: Record<string, any>;

  @Property({ length: 255, nullable: true })
  previewText?: string;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onUpdate: () => new Date(), onCreate: () => new Date() })
  updatedAt!: Date;
}
