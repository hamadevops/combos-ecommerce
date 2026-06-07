import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppFeedbackDto {
  @ApiProperty({ example: 'Nguyen Van A', required: false })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiProperty({ example: '/uploads/avatar.png', required: false })
  @IsString()
  @IsOptional()
  customerAvatar?: string;

  @ApiProperty({ example: 'Sản phẩm dùng rất mượt và tốt!', required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ example: 5, required: false })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @ApiProperty({ example: '/uploads/feedback_screenshot.png', required: false })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: 0, required: false })
  @IsInt()
  @IsOptional()
  sortOrder?: number;
}
