import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateRoleDto {
  @ApiPropertyOptional({
    example: 'Manager',
    description: 'Role name',
  })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'manager',
    description: 'Role key',
  })
  @IsOptional()
  key?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Parent role ID',
  })
  @IsOptional()
  parent_id?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Is default role (1 or 0)',
  })
  @IsOptional()
  is_default?: number;

  @ApiPropertyOptional({
    example: 'Role description',
    description: 'Role description',
  })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: [1, 2],
    description: 'Permission IDs',
  })
  @IsOptional()
  permission_ids?: number[];
}
