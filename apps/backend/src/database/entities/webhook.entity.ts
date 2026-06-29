import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ tableName: 'webhooks' })
export class Webhook {
  @ApiProperty({ description: 'Webhook ID', example: 1 })
  @PrimaryKey()
  id!: number;

  @ApiProperty({ description: 'Webhook Name', example: 'Order Notification' })
  @Property()
  name!: string;

  @ApiProperty({ description: 'Target URL', example: 'https://webhook.site/...' })
  @Property()
  url!: string;

  @ApiProperty({ description: 'HTTP Method', example: 'POST', default: 'POST' })
  @Property({ default: 'POST' })
  method!: string;

  @ApiProperty({ description: 'Is Enabled', example: true, default: true })
  @Property({ default: true })
  isEnabled!: boolean;

  /**
   * List of events that trigger this webhook.
   */
  @ApiProperty({ 
    description: 'Trigger Events', 
    example: ['order.created'], 
    type: [String] 
  })
  @Property({ type: 'json' })
  events!: string[];

  @ApiProperty({ 
    description: 'Custom Headers', 
    example: { 'Authorization': 'Bearer token' },
    required: false 
  })
  @Property({ type: 'json', nullable: true })
  headers?: Record<string, string>;

  @ApiProperty({ description: 'Created At' })
  @Property()
  createdAt: Date = new Date();

  @ApiProperty({ description: 'Updated At' })
  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
