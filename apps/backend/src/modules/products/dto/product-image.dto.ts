import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductImageDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    isArray: true,
    description: 'Danh sách file upload',
  })
  files: any[];

  @ApiPropertyOptional({ example: 0 })
  position?: number;

  @ApiPropertyOptional({ example: 'Áo thun mặt trước' })
  alt_text?: string;
}
