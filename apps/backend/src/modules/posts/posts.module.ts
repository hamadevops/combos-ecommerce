import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post } from 'src/database/entities/post.entity';
import { Topic } from 'src/database/entities/topic.entity';
import { Tag } from 'src/database/entities/tag.entity';
import { PostTopic } from 'src/database/entities/post-topic.entity';
import { PostTag } from 'src/database/entities/post-tag.entity';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([Post, Topic, Tag, PostTopic, PostTag]),
    UploadModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
