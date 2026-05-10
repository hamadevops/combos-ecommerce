// src/modules/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class MailService {
  constructor(
    @InjectQueue('mailer-processing')
    private readonly emailProcessingQueue: Queue,
  ) {}

  async sendMail(to: string, subject: string, body: string) {
    await this.emailProcessingQueue.add(
      'mailer-processing',
      { to, subject, body },
      {
        attempts: 3,
        backoff: { type: 'fixed', delay: 5000 },
      },
    );
  }
}
