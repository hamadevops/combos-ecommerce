import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'page_views' })
export class PageView {
  @PrimaryKey()
  id!: number;

  @Property({ length: 100, nullable: true })
  sessionId?: string;

  @Property({ length: 500 })
  path!: string;

  @Property({ length: 1000, nullable: true })
  queryString?: string;

  @Property({ length: 10, default: 'GET' })
  method: string = 'GET';

  @Property({ length: 45, nullable: true })
  ip?: string;

  @Property({ length: 500, nullable: true })
  userAgent?: string;

  @Property({ length: 500, nullable: true })
  referer?: string;

  @Property({ length: 20, nullable: true })
  deviceType?: string;

  @Property({ length: 50, nullable: true })
  browser?: string;

  @Property({ length: 50, nullable: true })
  os?: string;

  @Property({ length: 10, nullable: true })
  country?: string;

  @Property({ length: 100, nullable: true })
  utmSource?: string;

  @Property({ length: 100, nullable: true })
  utmMedium?: string;

  @Property({ length: 100, nullable: true })
  utmCampaign?: string;

  @Property({ nullable: true })
  responseTimeMs?: number;

  @Property({ nullable: true })
  statusCode?: number;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;
}
