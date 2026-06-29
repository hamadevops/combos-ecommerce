import { Module } from '@nestjs/common';
import { AppFeedbacksService } from './app-feedbacks.service';
import { AppFeedbacksController } from './app-feedbacks.controller';
import { AppFeedback } from '../../database/entities/app-feedback.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';

@Module({
  imports: [MikroOrmModule.forFeature([AppFeedback])],
  controllers: [AppFeedbacksController],
  providers: [AppFeedbacksService],
  exports: [AppFeedbacksService],
})
export class AppFeedbacksModule {}
