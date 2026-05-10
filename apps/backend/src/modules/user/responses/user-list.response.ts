import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { PaginationMetaDto } from 'src/common/dto/pagination-meta.dto';
import { UserResponse } from './user.response';

export class UserListResponseDto extends BaseResponseDto<UserResponse[]> {
  @ApiProperty({ type: [UserResponse], description: 'List of users' })
  declare data: UserResponse[];

  @ApiProperty({ type: PaginationMetaDto, description: 'Pagination metadata' })
  declare meta: PaginationMetaDto;
}
