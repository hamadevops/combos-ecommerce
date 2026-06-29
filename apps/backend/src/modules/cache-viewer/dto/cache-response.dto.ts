import { ApiProperty } from '@nestjs/swagger';

export class CacheKeysResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  count: number;

  @ApiProperty({ type: [String] })
  data: string[];
}

export class CacheValueResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data: any;
}
