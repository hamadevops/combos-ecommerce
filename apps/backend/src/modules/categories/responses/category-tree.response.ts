import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from '../../../common/dto/base-response.dto';

export class CategoryTreeItem {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Electronics' })
  name: string;

  @ApiProperty({ example: 'electronics' })
  slug: string;

  @ApiProperty({ type: [CategoryTreeItem], required: false })
  children?: CategoryTreeItem[];
}

export class CategoryTreeResponseDto extends BaseResponseDto<
  CategoryTreeItem[]
> {
  @ApiProperty({ type: [CategoryTreeItem] })
  declare data: CategoryTreeItem[];
}
