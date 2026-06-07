import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AppFeedbackResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty({ required: false })
  @Expose()
  customerName?: string;

  @ApiProperty({ required: false })
  @Expose()
  customerAvatar?: string;

  @ApiProperty({ required: false })
  @Expose()
  content?: string;

  @ApiProperty()
  @Expose()
  rating: number;

  @ApiProperty({ required: false })
  @Expose()
  image?: string;

  @ApiProperty()
  @Expose()
  isActive: boolean;

  @ApiProperty()
  @Expose()
  sortOrder: number;

  @ApiProperty()
  @Expose()
  createdAt: Date;
}
