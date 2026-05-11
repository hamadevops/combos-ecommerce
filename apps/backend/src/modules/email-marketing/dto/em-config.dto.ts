import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class EmConfigItemDto {
  @ApiProperty({ example: 'smtp_host' })
  @IsString()
  @IsNotEmpty()
  key!: string;

  @ApiProperty({ example: 'smtp.gmail.com' })
  @IsString()
  @IsOptional()
  value?: string;
}

export class UpdateEmConfigDto {
  @ApiProperty({
    type: [EmConfigItemDto],
    description: 'Danh sách config cần cập nhật',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmConfigItemDto)
  items!: EmConfigItemDto[];
}

export class TestEmConfigDto {
  @ApiProperty({ example: 'test@example.com', description: 'Email nhận thử' })
  @IsString()
  @IsNotEmpty()
  testEmail!: string;
}
