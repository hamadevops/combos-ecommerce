import { BullModule } from '@nestjs/bullmq';
import { Module, forwardRef } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { MailProcessor } from './mail.processor';
import { MailService } from './mail.service';
import { EmailMarketingModule } from '../email-marketing/email-marketing.module';

dotenv.config();

@Module({
  imports: [
    forwardRef(() => EmailMarketingModule),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number.parseInt(process.env.REDIS_PORT || '6379'),
        password: String(process.env.REDIS_PASSWORD),
        db: Number(process.env.REDIS_DB_NUMBER) || 0,
      },
    }),
    BullModule.registerQueue(
      { name: 'mailer-processing' },
      { name: 'campaign-processing' },
    ),
  ],
  providers: [MailProcessor, MailService],
  exports: [MailService, MailProcessor, BullModule],
})
export class MailerQueueModule {}
