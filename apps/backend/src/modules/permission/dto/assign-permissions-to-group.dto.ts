import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class AssignPermissionsToGroupDto {
  @ApiProperty({
    example: [1, 2, 3],
    description: 'Danh sách ID quyền cần gán vào nhóm',
    required: true,
    type: [Number],
  })
  @IsArray()
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  permission_ids: number[];
}
