import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsObject,
  IsEmail,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmTemplateDto {
  @ApiProperty({ example: 'Welcome Email' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Chào mừng {contact.firstName}!' })
  @IsString()
  @IsNotEmpty()
  subject!: string;

  @ApiProperty({
    example: '<html><body><h1>Xin chào {contact.firstName}</h1></body></html>',
  })
  @IsString()
  @IsNotEmpty()
  htmlContent!: string;

  @ApiProperty({
    description: 'JSON data từ visual builder (GrapesJS/Unlayer)',
    required: false,
  })
  @IsObject()
  @IsOptional()
  designData?: Record<string, any>;

  @ApiProperty({ example: 'Nhận ngay ưu đãi đặc biệt...', required: false })
  @IsString()
  @IsOptional()
  previewText?: string;
}

export class UpdateEmTemplateDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  htmlContent?: string;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  designData?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  previewText?: string;
}

export class PreviewEmTemplateDto {
  @ApiProperty({
    example: 1,
    description: 'Contact ID dùng để render preview (optional)',
    required: false,
  })
  @IsOptional()
  contactId?: number;

  @ApiProperty({
    description: 'Sample data nếu không có contactId',
    example: { firstName: 'John', lastName: 'Doe', email: 'john@test.com' },
    required: false,
  })
  @IsObject()
  @IsOptional()
  sampleData?: Record<string, any>;
}

export class SendTestEmTemplateDto {
  @ApiProperty({ example: 'test@example.com', description: 'Email nhận thử' })
  @IsEmail()
  @IsNotEmpty()
  testEmail!: string;
}
