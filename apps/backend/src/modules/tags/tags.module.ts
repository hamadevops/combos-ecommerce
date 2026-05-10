import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { Tag } from 'src/database/entities/tag.entity';
import { PostTag } from 'src/database/entities/post-tag.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Tag, PostTag])],
  controllers: [TagsController],
  providers: [TagsService],
  exports: [TagsService],
})
export class TagsModule {}
