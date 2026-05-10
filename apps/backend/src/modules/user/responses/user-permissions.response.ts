import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { UserResponse } from './user.response';

export class UserWithPermissionsResponse extends UserResponse {
  @ApiProperty({ type: [String], example: ['user.read', 'product.create'] })
  permissions: string[];
}

export class UserWithPermissionsResponseDto extends BaseResponseDto<UserWithPermissionsResponse> {
  @ApiProperty({ type: UserWithPermissionsResponse })
  declare data: UserWithPermissionsResponse;
}
