import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';

export class RegisterResponse {
  @ApiProperty({
    type: String,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  access_token: string;
}

export class RegisterResponseDto extends BaseResponseDto<RegisterResponse> {
  @ApiProperty({ type: RegisterResponse })
  declare data: RegisterResponse;
}
