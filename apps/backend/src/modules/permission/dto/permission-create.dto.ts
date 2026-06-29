import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    example: 'Profile',
    description: 'The name of the Permission',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'profile',
    description: 'The key of the permission',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({
    example: 'GET',
    description: 'The method of the permission GET, POST, PUT, DELETE, PATCH',
    required: false,
  })
  @IsString()
  @IsOptional()
  method?: string;

  @ApiProperty({
    example: 1,
    description: 'ID nhóm quyền',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  group_id?: number;
}
