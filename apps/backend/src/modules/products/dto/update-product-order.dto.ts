import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, ValidateNested } from 'class-validator';

export class UpdateProductOrderItem {
  @ApiProperty({ description: 'ID của sản phẩm', example: 1 })
  @IsInt()
  id: number;

  @ApiProperty({ description: 'Thứ tự hiển thị mới', example: 1 })
  @IsInt()
  display_order: number;
}

export class UpdateProductOrderDto {
  @ApiProperty({
    description: 'Danh sách sản phẩm cần cập nhật thứ tự hiển thị',
    type: [UpdateProductOrderItem],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProductOrderItem)
  products: UpdateProductOrderItem[];
}
