import { ApiProperty } from '@nestjs/swagger';

export class CustomerResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  fullName: string;

  @ApiProperty({ nullable: true })
  email?: string;

  @ApiProperty({ nullable: true })
  phone?: string;

  @ApiProperty({ nullable: true })
  city?: string;

  @ApiProperty({ nullable: true })
  district?: string;

  @ApiProperty({ nullable: true })
  ward?: string;

  @ApiProperty({ nullable: true })
  address?: string;

  @ApiProperty({ default: 0 })
  totalOrders: number;

  @ApiProperty({ default: 0 })
  totalSpent: number;

  @ApiProperty({ nullable: true })
  lastOrderAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
