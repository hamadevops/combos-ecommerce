import { ApiProperty } from '@nestjs/swagger';

export class ProductImageResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  url: string;

  @ApiProperty({ example: 1 })
  position: number;
}
