import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { FaqsService } from './faqs.service';
import { FaqsController } from './faqs.controller';
import { Faq } from '../../database/entities/faq.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Faq])],
  controllers: [FaqsController],
  providers: [FaqsService],
  exports: [FaqsService],
})
export class FaqsModule {}
