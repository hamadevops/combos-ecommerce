import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmSegmentDto {
  @ApiProperty({ example: 'VIP Customers' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Khách hàng thân thiết', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateEmSegmentDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

export class AssignContactsDto {
  @ApiProperty({ example: [1, 2, 3], description: 'Danh sách contact IDs' })
  @IsNotEmpty()
  contactIds!: number[];
}
