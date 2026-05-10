import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePageDto {
  @ApiProperty({ example: 'Privacy Policy' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'privacy-policy', required: false })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ example: '<h1>Privacy Policy</h1>...', required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ example: 'standard', required: false })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: 'Privacy Policy - My Store', required: false })
  @IsString()
  @IsOptional()
  metaTitle?: string;

  @ApiProperty({ example: 'Our privacy policy...', required: false })
  @IsString()
  @IsOptional()
  metaDescription?: string;

  @ApiProperty({ example: 'privacy, policy, terms', required: false })
  @IsString()
  @IsOptional()
  metaKeywords?: string;
}

export class UpdatePageDto extends CreatePageDto {}
