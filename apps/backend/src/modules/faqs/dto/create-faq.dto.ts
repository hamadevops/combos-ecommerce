import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFaqDto {
  @ApiProperty({ example: 'How do I return an item?' })
  @IsString()
  @IsNotEmpty()
  question!: string;

  @ApiProperty({ example: 'You can return items within 30 days...' })
  @IsString()
  @IsNotEmpty()
  answer!: string;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  sortOrder?: number;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateFaqDto extends CreateFaqDto {}
