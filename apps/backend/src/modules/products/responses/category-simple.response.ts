import { ApiProperty } from '@nestjs/swagger';

export class CategorySimpleResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Electronics' })
  name: string;

  @ApiProperty({ example: 'electronics' })
  slug: string;
}
