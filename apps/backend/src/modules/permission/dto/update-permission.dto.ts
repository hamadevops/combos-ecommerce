import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePermissionDto {
  @ApiPropertyOptional({
    example: 'Quản lý Sản phẩm',
    description: 'Tên quyền',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'product.create',
    description: 'Key quyền',
  })
  @IsString()
  @IsOptional()
  key?: string;

  @ApiPropertyOptional({
    example: 'GET',
    description: 'HTTP method (GET, POST, PUT, DELETE, PATCH)',
  })
  @IsString()
  @IsOptional()
  method?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID nhóm quyền (null để bỏ nhóm)',
  })
  @IsNumber()
  @IsOptional()
  group_id?: number | null;
}
