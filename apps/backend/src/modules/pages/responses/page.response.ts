import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class PageResponse {
  @ApiProperty()
  @Expose()
  id!: number;

  @ApiProperty()
  @Expose()
  title!: string;

  @ApiProperty()
  @Expose()
  slug!: string;

  @ApiProperty()
  @Expose()
  content?: string;

  @ApiProperty()
  @Expose()
  type: string = 'standard';

  @ApiProperty()
  @Expose()
  isActive: boolean = true;

  @ApiProperty()
  @Expose()
  metaTitle?: string;

  @ApiProperty()
  @Expose()
  metaDescription?: string;

  @ApiProperty()
  @Expose()
  metaKeywords?: string;

  @ApiProperty()
  @Expose()
  createdAt!: Date;

  @ApiProperty()
  @Expose()
  updatedAt!: Date;
}
