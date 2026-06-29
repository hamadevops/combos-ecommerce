import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class UpdateUserRoleDto {
  @ApiProperty({
    example: 1,
    description: 'Role ID to assign to user',
  })
  @IsInt()
  @IsPositive()
  roleId: number;
}
