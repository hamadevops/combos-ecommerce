import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePermissionGroupDto {
  @ApiProperty({
    example: 'Quản lý Sản phẩm',
    description: 'Tên nhóm quyền',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'product',
    description: 'Key nhóm quyền (unique)',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({
    example: 1,
    description: 'Thứ tự hiển thị',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  display_order?: number;
}
