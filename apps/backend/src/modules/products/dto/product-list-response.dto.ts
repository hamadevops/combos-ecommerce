import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { PaginationMetaDto } from 'src/common/dto/pagination-meta.dto';
import { ProductResponse } from './product-response.dto';

export class ProductListResponseDto extends BaseResponseDto<ProductResponse[]> {
  @ApiProperty({ type: [ProductResponse], description: 'Array of products' })
  declare data: ProductResponse[];

  @ApiProperty({ type: PaginationMetaDto, description: 'Pagination metadata' })
  declare meta: PaginationMetaDto;
}

export class ProductSingleResponseDto extends BaseResponseDto<ProductResponse> {
  @ApiProperty({ type: ProductResponse, description: 'Product details' })
  declare data: ProductResponse;

  @ApiProperty({ example: null, nullable: true })
  declare meta: null;
}
