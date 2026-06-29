import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from '../../../common/dto/base-response.dto';
import { PaginationMetaDto } from '../../../common/dto/pagination-meta.dto';

export class CategoryResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Electronics' })
  name: string;

  @ApiProperty({ example: 'electronics' })
  slug: string;

  @ApiProperty({ example: 'Description...' })
  description: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CategorySingleResponseDto extends BaseResponseDto<CategoryResponse> {
  @ApiProperty({ type: CategoryResponse })
  declare data: CategoryResponse;
}

export class CategoryListResponseDto extends BaseResponseDto<
  CategoryResponse[]
> {
  @ApiProperty({ type: [CategoryResponse] })
  declare data: CategoryResponse[];

  @ApiProperty({ type: PaginationMetaDto })
  declare meta: PaginationMetaDto;
}
