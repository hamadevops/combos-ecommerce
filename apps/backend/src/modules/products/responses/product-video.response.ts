import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductVideoResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'https://storage.example.com/products/videos/demo.mp4' })
  videoUrl: string;

  @ApiPropertyOptional({ example: 'https://storage.example.com/thumbnails/demo.jpg' })
  thumbnailUrl?: string;

  @ApiProperty({ example: 0 })
  displayOrder: number;

  @ApiProperty({ example: 1 })
  isVisible: number;
}
