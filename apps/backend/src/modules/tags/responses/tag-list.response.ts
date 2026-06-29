import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from '../../../common/dto/base-response.dto';
import { PaginationMetaDto } from '../../../common/dto/pagination-meta.dto';
import { Tag } from '../../../database/entities/tag.entity';

export class TagResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'JavaScript' })
  name: string;

  @ApiProperty({ example: 'javascript' })
  slug: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class TagSingleResponseDto extends BaseResponseDto<TagResponse> {
  @ApiProperty({ type: TagResponse })
  declare data: TagResponse;
}

export class TagListResponseDto extends BaseResponseDto<TagResponse[]> {
  @ApiProperty({ type: [TagResponse] })
  declare data: TagResponse[];

  @ApiProperty({ type: PaginationMetaDto })
  declare meta: PaginationMetaDto;
}
