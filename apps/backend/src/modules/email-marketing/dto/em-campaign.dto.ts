import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EmCampaignStatus } from 'src/database/entities/email-marketing/em-campaign.entity';

export class CreateEmCampaignDto {
  @ApiProperty({ example: 'Khuyến mãi Tết 2025' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 1, description: 'Template ID' })
  @IsNumber()
  @IsNotEmpty()
  templateId!: number;

  @ApiProperty({ example: [1, 2], description: 'Segment IDs' })
  @IsArray()
  @IsNotEmpty()
  segmentIds!: number[];

  @ApiProperty({ example: 'Thiên Phú Store', required: false })
  @IsString()
  @IsOptional()
  fromName?: string;

  @ApiProperty({ example: 'sale@thienphustore.vn', required: false })
  @IsEmail()
  @IsOptional()
  fromEmail?: string;
}

export class UpdateEmCampaignDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  templateId?: number;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  segmentIds?: number[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  fromName?: string;

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  fromEmail?: string;

  @ApiProperty({ enum: EmCampaignStatus, required: false })
  @IsEnum(EmCampaignStatus)
  @IsOptional()
  status?: EmCampaignStatus;
}

export class ScheduleEmCampaignDto {
  @ApiProperty({
    example: '2025-02-01T09:00:00.000Z',
    description: 'Thời gian gửi (ISO 8601)',
  })
  @IsDateString()
  @IsNotEmpty()
  scheduledAt!: string;
}

export class SendTestEmCampaignDto {
  @ApiProperty({ example: 'test@example.com', description: 'Email nhận thử' })
  @IsEmail()
  @IsNotEmpty()
  testEmail!: string;
}
