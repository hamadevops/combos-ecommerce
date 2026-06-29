import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class FaqResponse {
  @ApiProperty()
  @Expose()
  id!: number;

  @ApiProperty()
  @Expose()
  question!: string;

  @ApiProperty()
  @Expose()
  answer!: string;

  @ApiProperty()
  @Expose()
  sortOrder: number = 0;

  @ApiProperty()
  @Expose()
  isActive: boolean = true;

  @ApiProperty()
  @Expose()
  createdAt!: Date;

  @ApiProperty()
  @Expose()
  updatedAt!: Date;
}
