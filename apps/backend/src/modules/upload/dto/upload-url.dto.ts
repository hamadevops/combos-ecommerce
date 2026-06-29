import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class UploadUrlDto {
  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsUrl()
  url: string;
}
