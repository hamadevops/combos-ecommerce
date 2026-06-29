import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePermissionGroupDto {
  @ApiProperty({
    example: 'Quản lý Sản phẩm',
    description: 'Tên nhóm quyền',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 'product',
    description: 'Key nhóm quyền',
    required: false,
  })
  @IsString()
  @IsOptional()
  key?: string;

  @ApiProperty({
    example: 1,
    description: 'Thứ tự hiển thị',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  display_order?: number;
}
