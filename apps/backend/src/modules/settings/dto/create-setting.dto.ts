import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSettingDto {
  @ApiProperty({ example: 'site_title' })
  @IsString()
  @IsNotEmpty()
  key!: string;

  @ApiProperty({ example: 'My Awesome Store', required: false })
  @IsString()
  @IsOptional()
  value?: string;

  @ApiProperty({ example: 'string', required: false })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiProperty({ example: 'general', description: 'Group: general, contact, social, appearance, footer', required: false })
  @IsString()
  @IsOptional()
  group?: string;
}

export class UpdateSettingDto extends CreateSettingDto {}
