import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ProductSeoDto {
  @ApiPropertyOptional()
  @IsString()
  seo_title?: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsString()
  seo_description?: string;

  @ApiPropertyOptional()
  @IsString()
  seo_keywords?: string;

  @ApiPropertyOptional()
  @IsString()
  canonical_url?: string;

  @ApiPropertyOptional()
  @IsString()
  og_image?: string;
}
