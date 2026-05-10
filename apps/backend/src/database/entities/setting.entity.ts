import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'settings' })
export class Setting {
  @PrimaryKey()
  id!: number; /**
   * The key of the setting (e.g. 'site_title', 'contact_email')
   */
  @Property({ unique: true, length: 255 })
  key!: string;

  /**
   * The value of the setting. Can be simple string or JSON string.
   */
  @Property({ type: 'text', nullable: true })
  value?: string;

  /**
   * The type of the value (e.g. 'string', 'boolean', 'json', 'number')
   */
  @Property({ default: 'string', length: 50 })
  type: string = 'string';

  /**
   * Whether this setting is public (visible to frontend without auth)
   */
  @Property({ default: false })
  isPublic: boolean = false;

  /**
   * Group for categorizing settings (e.g. 'general', 'contact', 'social', 'appearance')
   */
  @Property({ default: 'general', length: 50 })
  group: string = 'general';

  /**
   * Human readable label for the setting
   */
  @Property({ length: 255, nullable: true })
  label?: string;

  /**
   * Description or help text for the setting
   */
  @Property({ type: 'text', nullable: true })
  description?: string;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onUpdate: () => new Date() })
  updatedAt!: Date;
}
