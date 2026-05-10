import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { TopicsService } from './topics.service';
import { TopicsController } from './topics.controller';
import { Topic } from 'src/database/entities/topic.entity';
import { PostTopic } from 'src/database/entities/post-topic.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Topic, PostTopic])],
  controllers: [TopicsController],
  providers: [TopicsService],
  exports: [TopicsService],
})
export class TopicsModule {}
