import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class RoleCreateDto {
  @ApiProperty({
    example: 'Manager',
    description: 'The name of the role',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'manager',
    description: 'The key of the role unique',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'The parent role id',
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  parent_id?: number;

  @ApiPropertyOptional({
    example: [1, 2],
    description: 'Permission IDs',
  })
  @IsOptional()
  permission_ids?: number[];

  @ApiPropertyOptional({
    example: 'Role description',
    description: 'Role description',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
