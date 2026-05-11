import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  ManyToMany,
  Collection,
  Enum,
} from '@mikro-orm/core';
import { EmTemplate } from './em-template.entity';
import { EmSegment } from './em-segment.entity';

export enum EmCampaignStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
}

@Entity({ tableName: 'em_campaigns' })
export class EmCampaign {
  @PrimaryKey()
  id!: number;

  @Property({ length: 255 })
  name!: string;

  @ManyToOne(() => EmTemplate, { nullable: true })
  template?: EmTemplate;

  @Property({ length: 255, nullable: true })
  fromName?: string;

  @Property({ length: 255, nullable: true })
  fromEmail?: string;

  @Property({ nullable: true })
  scheduledAt?: Date;

  @Enum(() => EmCampaignStatus)
  status: EmCampaignStatus = EmCampaignStatus.DRAFT;

  @Property({ nullable: true })
  completedAt?: Date;

  @Property({ default: 0 })
  totalSent: number = 0;

  @Property({ default: 0 })
  totalFailed: number = 0;

  @Property({ default: 0 })
  totalOpened: number = 0;

  @Property({ default: 0 })
  totalClicked: number = 0;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onUpdate: () => new Date(), onCreate: () => new Date() })
  updatedAt: Date = new Date();

  @Property({ nullable: true })
  deletedAt?: Date;

  @ManyToMany(() => EmSegment, undefined, {
    owner: true,
    pivotTable: 'em_campaign_segments',
  })
  segments = new Collection<EmSegment>(this);
}
