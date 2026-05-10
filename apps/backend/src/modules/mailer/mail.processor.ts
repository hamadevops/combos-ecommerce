// src/modules/mail/mail.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';

@Processor('mailer-processing')
export class MailProcessor extends WorkerHost {
  constructor() {
    super();
  }
  process(job: any): Promise<void> {
    console.log('Processing mail job:', job.id, job.data);
    return Promise.resolve();
  }
}
