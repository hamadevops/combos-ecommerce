import { Entity, PrimaryKey, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { EmCampaign } from './em-campaign.entity';

export enum EmEmailLogStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  OPENED = 'OPENED',
}

@Entity({ tableName: 'em_email_logs' })
export class EmEmailLog {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => EmCampaign, { deleteRule: 'cascade' })
  campaign!: EmCampaign;

  @Property({ index: true })
  contactId!: number;

  @Property({ length: 255 })
  contactEmail!: string;

  @Enum(() => EmEmailLogStatus)
  status: EmEmailLogStatus = EmEmailLogStatus.PENDING;

  @Property({ type: 'text', nullable: true })
  errorMessage?: string;

  @Property({ nullable: true })
  sentAt?: Date;

  @Property({ nullable: true })
  openedAt?: Date;

  @Property({ default: 0 })
  openCount: number = 0;

  @Property({ default: 0 })
  clickCount: number = 0;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;
}
