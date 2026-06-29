import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { EmEmailLog } from './em-email-log.entity';
import { EmTrackedLink } from './em-tracked-link.entity';

@Entity({ tableName: 'em_link_clicks' })
export class EmLinkClick {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => EmEmailLog, { deleteRule: 'cascade' })
  emailLog!: EmEmailLog;

  @ManyToOne(() => EmTrackedLink, { deleteRule: 'cascade' })
  trackedLink!: EmTrackedLink;

  @Property({ length: 45, nullable: true })
  ipAddress?: string;

  @Property({ type: 'text', nullable: true })
  userAgent?: string;

  @Property({ onCreate: () => new Date() })
  clickedAt!: Date;
}
