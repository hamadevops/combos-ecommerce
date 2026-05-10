import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto<T> {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426655440000' })
  traceId: string;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Success' })
  message: string;

  // Swagger không support generic tốt → sẽ override ở response cụ thể
  data: T;

  @ApiProperty({
    example: null,
    nullable: true,
  })
  meta?: any;
}
