import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from '../../../common/dto/base-response.dto';
import { PaginationMetaDto } from '../../../common/dto/pagination-meta.dto';

export class TopicResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Technology' })
  name: string;

  @ApiProperty({ example: 'technology' })
  slug: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class TopicSingleResponseDto extends BaseResponseDto<TopicResponse> {
  @ApiProperty({ type: TopicResponse })
  declare data: TopicResponse;
}

export class TopicListResponseDto extends BaseResponseDto<TopicResponse[]> {
  @ApiProperty({ type: [TopicResponse] })
  declare data: TopicResponse[];

  @ApiProperty({ type: PaginationMetaDto })
  declare meta: PaginationMetaDto;
}
