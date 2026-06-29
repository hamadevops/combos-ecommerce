import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { PaginationMetaDto } from 'src/common/dto/pagination-meta.dto';

export class RoleResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PermissionGroupResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  key: string;

  @ApiProperty()
  display_order: number;
}

export class PermissionResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  resource: string;

  @ApiProperty()
  action: string;

  @ApiProperty()
  method: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ type: PermissionGroupResponse, required: false })
  group?: PermissionGroupResponse;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class RoleResponseDto extends BaseResponseDto<RoleResponse> {
  @ApiProperty({ type: RoleResponse })
  declare data: RoleResponse;
}

export class RoleListResponseDto extends BaseResponseDto<RoleResponse[]> {
  @ApiProperty({ type: [RoleResponse] })
  declare data: RoleResponse[];

  @ApiProperty({ type: PaginationMetaDto })
  declare meta: PaginationMetaDto;
}

export class PermissionResponseDto extends BaseResponseDto<PermissionResponse> {
  @ApiProperty({ type: PermissionResponse })
  declare data: PermissionResponse;
}

export class PermissionListResponseDto extends BaseResponseDto<PermissionResponse[]> {
  @ApiProperty({ type: [PermissionResponse] })
  declare data: PermissionResponse[];

  @ApiProperty({ type: PaginationMetaDto })
  declare meta: PaginationMetaDto;
}
