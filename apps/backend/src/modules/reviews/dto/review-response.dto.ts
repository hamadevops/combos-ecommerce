import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ReviewResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  rating: number;

  @ApiProperty()
  @Expose()
  comment: string;

  @ApiProperty()
  @Expose()
  reviewerName: string;

  @ApiProperty({ required: false })
  @Expose()
  reviewerAvatar?: string;

  @ApiProperty({ required: false })
  @Expose()
  image?: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;
}
