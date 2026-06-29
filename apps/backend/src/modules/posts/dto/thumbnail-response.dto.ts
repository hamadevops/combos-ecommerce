import { ApiProperty } from '@nestjs/swagger';

export class ThumbnailResponseDto {
  @ApiProperty()
  thumbnail: string;
}
