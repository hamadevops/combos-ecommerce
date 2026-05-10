import { IsNotEmpty, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty()
  @IsNumber()
  productId!: number;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  comment!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reviewerName!: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  reviewerAvatar?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  image?: string;
}
