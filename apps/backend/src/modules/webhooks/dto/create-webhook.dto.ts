import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUrl,
  IsArray,
  IsBoolean,
  IsOptional,
  IsObject,
  IsIn,
} from 'class-validator';

export class CreateWebhookDto {
  @ApiProperty({ description: 'Webhook Name', example: 'Order Notification' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Target URL', example: 'https://webhook.site/...' })
  @IsUrl({ require_tld: false })
  url: string;

  @ApiPropertyOptional({ description: 'HTTP Method', default: 'POST', example: 'POST' })
  @IsOptional()
  @IsIn(['POST'])
  method?: string = 'POST';

  @ApiProperty({ 
    description: 'Events to trigger this webhook', 
    example: ['order.created', 'product.updated'],
    isArray: true 
  })
  @IsArray()
  @IsString({ each: true })
  events: string[];

  @ApiPropertyOptional({ description: 'Is Webhook Enabled', default: true })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean = true;

  @ApiPropertyOptional({ 
    description: 'Custom Headers', 
    example: { 'Authorization': 'Bearer token' } 
  })
  @IsOptional()
  @IsObject()
  headers?: Record<string, string>;
}
