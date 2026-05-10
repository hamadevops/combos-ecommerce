import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';

export class PopupResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  image?: string;

  @ApiProperty()
  link: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ enum: ['center', 'bottom-right', 'top-bar'] })
  position: string;

  @ApiProperty()
  priority: number;

  @ApiProperty({ nullable: true })
  startDate?: Date;

  @ApiProperty({ nullable: true })
  endDate?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PopupResponseDto extends BaseResponseDto<PopupResponse> {
  @ApiProperty({ type: PopupResponse })
  declare data: PopupResponse;
}

export class PopupListResponseDto extends BaseResponseDto<PopupResponse[]> {
  @ApiProperty({ type: [PopupResponse] })
  declare data: PopupResponse[];
}
