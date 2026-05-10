import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { MailProcessor } from './mail.processor';
import { MailService } from './mail.service';

dotenv.config();

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number.parseInt(process.env.REDIS_PORT || '6379'),
        password: String(process.env.REDIS_PASSWORD),
        db: Number(process.env.REDIS_DB_NUMBER) || 0,
      },
    }),
    BullModule.registerQueue({
      name: 'mailer-processing',
    }),
  ],
  providers: [MailProcessor, MailService],
  exports: [MailService, MailProcessor],
})
export class MailerQueueModule {}
