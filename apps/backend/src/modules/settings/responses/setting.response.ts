import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SettingResponse {
  @ApiProperty()
  @Expose()
  id!: number;

  @ApiProperty()
  @Expose()
  key!: string;

  @ApiProperty()
  @Expose()
  value?: string;

  @ApiProperty()
  @Expose()
  type: string = 'string';

  @ApiProperty()
  @Expose()
  isPublic: boolean = false;

  @ApiProperty()
  @Expose()
  group: string = 'general';

  @ApiProperty()
  @Expose()
  createdAt!: Date;

  @ApiProperty()
  @Expose()
  updatedAt!: Date;
}
