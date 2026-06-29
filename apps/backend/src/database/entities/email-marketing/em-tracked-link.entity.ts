import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { EmCampaign } from './em-campaign.entity';

@Entity({ tableName: 'em_tracked_links' })
export class EmTrackedLink {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => EmCampaign, { deleteRule: 'cascade' })
  campaign!: EmCampaign;

  @Property({ type: 'text' })
  originalUrl!: string;

  @Property({ unique: true, length: 64, index: true })
  hash!: string;

  @Property({ default: 0 })
  clickCount: number = 0;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;
}
