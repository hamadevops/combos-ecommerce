import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { Role } from 'src/database/entities/role.entity';

export class UserResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  avatar?: string;

  @ApiProperty({ nullable: true })
  bio?: string;

  @ApiProperty({ nullable: true })
  background?: string;

  @ApiProperty({ nullable: true })
  phone?: string;

  @ApiProperty({ example: { id: 1, name: 'Admin' } })
  role?: Role;

  @ApiProperty()
  createdAt?: string;

  @ApiProperty()
  updatedAt?: string;

  @ApiProperty()
  isActive?: boolean;
}

export class UserResponseDto extends BaseResponseDto<UserResponse> {
  @ApiProperty({ type: UserResponse })
  declare data: UserResponse;
}
