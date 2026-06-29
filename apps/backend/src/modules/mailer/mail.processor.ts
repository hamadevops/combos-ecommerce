// src/modules/mail/mail.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { Job } from 'bullmq';
import * as nodemailer from 'nodemailer';
import { EmConfigService } from '../email-marketing/services/em-config.service';
import {
  EmEmailLog,
  EmEmailLogStatus,
} from 'src/database/entities/email-marketing/em-email-log.entity';

@Processor('mailer-processing')
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(
    private readonly configService: EmConfigService,
    private readonly em: EntityManager,
  ) {
    super();
  }

  async process(
    job: Job<{
      to: string;
      subject: string;
      body: string;
      from?: string;
      logId?: number;
    }>,
  ): Promise<void> {
    const { to, subject, body, from, logId } = job.data;
    this.logger.log(
      `Processing mail job ${job.id}: to=${to}, subject=${subject}`,
    );

    const em = this.em.fork();

    try {
      const smtp = await this.configService.getSmtpConfig(em);

      if (!smtp.host) {
        throw new Error('SMTP chưa được cấu hình');
      }

      const transporter = nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: smtp.secure,
        auth: { user: smtp.user, pass: smtp.pass },
      });

      const fromAddress = from || `"${smtp.fromName}" <${smtp.fromEmail}>`;

      await transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        html: body,
        replyTo: smtp.replyTo || undefined,
      });

      this.logger.log(`Email sent successfully to ${to}`);

      // Update email log if logId provided
      if (logId) {
        await this.updateEmailLog(em, logId, EmEmailLogStatus.SENT);
      }
    } catch (error: any) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);

      // Update email log with error
      if (logId) {
        await this.updateEmailLog(
          em,
          logId,
          EmEmailLogStatus.FAILED,
          error.message,
        );
      }

      throw error; // Re-throw to trigger BullMQ retry
    }
  }

  private async updateEmailLog(
    em: EntityManager,
    logId: number,
    status: EmEmailLogStatus,
    errorMessage?: string,
  ) {
    try {
      const emailLog = await em.findOne(EmEmailLog, logId);
      if (emailLog) {
        emailLog.status = status;
        if (status === EmEmailLogStatus.SENT) {
          emailLog.sentAt = new Date();
        }
        if (errorMessage) {
          emailLog.errorMessage = errorMessage;
        }
        await em.flush();
      }
    } catch (err) {
      this.logger.warn(`Failed to update email log #${logId}: ${err}`);
    }
  }
}
