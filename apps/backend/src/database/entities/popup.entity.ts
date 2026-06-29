import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core';

export enum PopupPosition {
  CENTER = 'CENTER',
  FOOTER = 'FOOTER',
  SIDEBAR = 'SIDEBAR',
}

@Entity({ tableName: 'popups' })
export class Popup {
  @PrimaryKey()
  id!: number;

  @Property({ nullable: true })
  title?: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ nullable: true })
  link?: string;

  @Property({ nullable: true })
  image_url?: string;

  @Property({ nullable: true })
  promo_code?: string;

  @Property({ default: 0 })
  priority!: number;

  @Property({ default: true })
  status!: boolean;

  @Enum(() => PopupPosition)
  position!: PopupPosition;

  @Property({ onCreate: () => new Date() })
  created_at?: Date = new Date();

  @Property({ onUpdate: () => new Date(), onCreate: () => new Date() })
  updated_at?: Date = new Date();
}
