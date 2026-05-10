import { ApiProperty } from '@nestjs/swagger';

export class ProductVariantResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Red / XL' })
  name: string;

  @ApiProperty({ example: 100 })
  price: number;

  @ApiProperty({ example: 10 })
  stock: number;
}
