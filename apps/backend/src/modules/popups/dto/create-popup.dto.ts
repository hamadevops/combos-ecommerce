import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PopupPosition } from '../../../database/entities/popup.entity';
import { Transform } from 'class-transformer';

export class CreatePopupDto {
  @ApiProperty({
    example: 'Summer Sale',
    description: 'Title of the popup',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    example: 'Summer Sale Description',
    description: 'Description of the popup',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'https://example.com',
    description: 'Link for the popup',
  })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiProperty({
    example: 'https://example.com/image.png',
    description: 'Image URL',
  })
  @IsOptional()
  @IsString()
  image_url?: string;

  @ApiProperty({
    example: 'SUMMER20',
    description: 'Promo code',
  })
  @IsOptional()
  @IsString()
  promo_code?: string;

  @ApiProperty({ example: 1, description: 'Priority of the popup' })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  priority?: number;

  @ApiProperty({ example: true, description: 'Status of the popup' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  status?: boolean;

  @ApiProperty({
    enum: PopupPosition,
    example: PopupPosition.CENTER,
    description: 'Position of the popup',
  })
  @IsEnum(PopupPosition)
  position: PopupPosition;
}
