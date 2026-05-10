import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({ example: 'Tutorial', description: 'Tag name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'tutorial', description: 'Tag slug', required: false })
  @IsString()
  @IsOptional()
  slug?: string;
}
