
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PopupsService } from './popups.service';
import { PopupsController } from './popups.controller';
import { Popup } from '../../database/entities/popup.entity';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([Popup]),
    UploadModule,
  ],
  controllers: [PopupsController],
  providers: [PopupsService],
})
export class PopupsModule { }
