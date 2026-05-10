import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from '../../../common/dto/base-response.dto';
import { PaginationMetaDto } from '../../../common/dto/pagination-meta.dto';

import { TopicResponse } from '../../topics/responses/topic-list.response';
import { TagResponse } from '../../tags/responses/tag-list.response';

class AuthorResponse {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;
    
    @ApiProperty({ nullable: true })
    avatar?: string;
}

export class PostResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Getting Started with NestJS' })
  title: string;

  @ApiProperty({ example: 'getting-started-with-nestjs' })
  slug: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', nullable: true })
  thumbnail?: string;

  @ApiProperty({ example: 'Content...' })
  content: string;

  @ApiProperty({ example: 'Excerpt...' })
  excerpt: string;

  @ApiProperty({ type: AuthorResponse })
  author: AuthorResponse;

  @ApiProperty({ type: [TopicResponse] })
  topics: TopicResponse[];

  @ApiProperty({ type: [TagResponse] })
  tags: TagResponse[];

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: true })
  isPublished: boolean;

  @ApiProperty({ nullable: true })
  publishedAt?: Date;

  @ApiProperty({ example: 100 })
  viewCount: number;

  @ApiProperty({ nullable: true })
  metaTitle?: string;

  @ApiProperty({ nullable: true })
  metaDescription?: string;

  @ApiProperty({ nullable: true })
  metaKeywords?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PostSingleResponseDto extends BaseResponseDto<PostResponse> {
  @ApiProperty({ type: PostResponse })
  declare data: PostResponse;
}

export class PostListResponseDto extends BaseResponseDto<PostResponse[]> {
  @ApiProperty({ type: [PostResponse] })
  declare data: PostResponse[];

  @ApiProperty({ type: PaginationMetaDto })
  declare meta: PaginationMetaDto;
}
