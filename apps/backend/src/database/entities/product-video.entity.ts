import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
} from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from './product.entity';

@Entity({ tableName: 'product_videos' })
export class ProductVideo {
  @ApiProperty({ description: 'ID of the product video', example: 1 })
  @PrimaryKey()
  id!: number;

  @ApiProperty({ description: 'The product this video belongs to', type: () => Product })
  @ManyToOne(() => Product, { deleteRule: 'cascade' })
  product!: Product;

  @ApiProperty({ description: 'URL of the video (e.g., MP4 file or YouTube link)', example: 'https://youtube.com/...' })
  @Property()
  videoUrl!: string;

  @ApiProperty({ description: 'Thumbnail URL for the video', example: 'https://...', required: false })
  @Property({ nullable: true })
  thumbnailUrl?: string;

  @ApiProperty({ description: 'Display order of the video', example: 0 })
  @Property({ default: 0 })
  displayOrder: number = 0;

  @ApiProperty({ description: 'Visibility status (1: Visible, 0: Hidden)', example: 1 })
  @Property({ default: 1 })
  isVisible: number = 1;

  @ApiProperty({ description: 'Creation date' })
  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update date' })
  @Property({ onUpdate: () => new Date(), onCreate: () => new Date() })
  updatedAt!: Date;
}
