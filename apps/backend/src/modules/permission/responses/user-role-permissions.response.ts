import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { PermissionResponse } from './permission-role.response';

class UserSimpleResponse {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  email: string;
}

class RoleSimpleResponse {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  key: string;
}

export class UserRolePermissionsResponse {
  @ApiProperty({ type: UserSimpleResponse })
  user: UserSimpleResponse;

  @ApiProperty({ type: RoleSimpleResponse })
  role: RoleSimpleResponse;

  @ApiProperty({ type: [PermissionResponse] })
  permissions: PermissionResponse[];
}

export class UserRolePermissionsResponseDto extends BaseResponseDto<UserRolePermissionsResponse> {
  @ApiProperty({ type: UserRolePermissionsResponse })
  declare data: UserRolePermissionsResponse;
}
