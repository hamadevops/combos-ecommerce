import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';

export class LoginResponse {
  @ApiProperty({
    type: String,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  access_token: string;
}

export class LoginResponseDto extends BaseResponseDto<LoginResponse> {
  @ApiProperty({ type: LoginResponse })
  declare data: LoginResponse;
}
