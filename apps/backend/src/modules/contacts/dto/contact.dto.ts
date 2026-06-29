import { IsEmail, IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ContactStatus, ContactType } from '../../../database/entities/contact.entity';

export class SubmitNewsletterDto {
  @ApiProperty({ example: 'test@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  utmSource?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  utmMedium?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  utmCampaign?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  utmTerm?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  utmContent?: string;
}

export class SubmitContactFormDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'test@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ required: false, example: '0901234567' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'I want to ask about your services.' })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiProperty({ required: false, type: Object, description: 'Additional flexible metadata associated with the submission' })
  @IsOptional()
  metadata?: Record<string, any>;

  /**
   * UTM parameters for tracking marketing sources
   */
  @ApiProperty({ required: false, description: 'UTM Source (e.g. google, facebook)' })
  @IsString()
  @IsOptional()
  utmSource?: string;

  @ApiProperty({ required: false, description: 'UTM Medium (e.g. cpc, banner, email)' })
  @IsString()
  @IsOptional()
  utmMedium?: string;

  @ApiProperty({ required: false, description: 'UTM Campaign Name' })
  @IsString()
  @IsOptional()
  utmCampaign?: string;

  @ApiProperty({ required: false, description: 'UTM Term (usually search keywords)' })
  @IsString()
  @IsOptional()
  utmTerm?: string;

  @ApiProperty({ required: false, description: 'UTM Content (used to differentiate similar content or links)' })
  @IsString()
  @IsOptional()
  utmContent?: string;
}

export class UpdateContactStatusDto {
  @ApiProperty({ enum: ContactStatus, example: ContactStatus.READ })
  @IsEnum(ContactStatus)
  @IsNotEmpty()
  status!: ContactStatus;
}

export class CreateContactDto {
  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'test@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ required: false, example: '0901234567' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'I want to ask about your services.', required: false })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({ enum: ContactType, example: ContactType.CONTACT_FORM })
  @IsEnum(ContactType)
  @IsNotEmpty()
  type!: ContactType;

  @ApiProperty({ enum: ContactStatus, example: ContactStatus.UNREAD })
  @IsEnum(ContactStatus)
  @IsOptional()
  status?: ContactStatus;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateContactDto {
  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'test@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false, example: '0901234567' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'I want to ask about your services.', required: false })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({ enum: ContactType, example: ContactType.CONTACT_FORM, required: false })
  @IsEnum(ContactType)
  @IsOptional()
  type?: ContactType;

  @ApiProperty({ enum: ContactStatus, example: ContactStatus.UNREAD, required: false })
  @IsEnum(ContactStatus)
  @IsOptional()
  status?: ContactStatus;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  metadata?: Record<string, any>;
}
