import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';
import { Page } from '../../database/entities/page.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Page])],
  controllers: [PagesController],
  providers: [PagesService],
  exports: [PagesService],
})
export class PagesModule {}
