import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/mysql';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import {
  EmCampaign,
  EmCampaignStatus,
} from 'src/database/entities/email-marketing/em-campaign.entity';
import {
  EmEmailLog,
  EmEmailLogStatus,
} from 'src/database/entities/email-marketing/em-email-log.entity';
import { EmContact } from 'src/database/entities/email-marketing/em-contact.entity';
import { EmConfigService } from '../services/em-config.service';
import { EmTemplateCompilerService } from '../services/em-template-compiler.service';
import { EmTrackedLink } from 'src/database/entities/email-marketing/em-tracked-link.entity';

@Processor('campaign-processing', {
  limiter: { max: 10, duration: 1000 }, // Max 10 emails per second
})
export class EmCampaignProcessor extends WorkerHost {
  private readonly logger = new Logger(EmCampaignProcessor.name);

  constructor(
    @InjectRepository(EmCampaign)
    private readonly campaignRepo: EntityRepository<EmCampaign>,
    @InjectRepository(EmEmailLog)
    private readonly emailLogRepo: EntityRepository<EmEmailLog>,
    @InjectRepository(EmTrackedLink)
    private readonly trackedLinkRepo: EntityRepository<EmTrackedLink>,
    @InjectRepository(EmContact)
    private readonly contactRepo: EntityRepository<EmContact>,
    private readonly em: EntityManager,
    private readonly configService: EmConfigService,
    private readonly compiler: EmTemplateCompilerService,
    @InjectQueue('mailer-processing')
    private readonly mailerQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<{ campaignId: number }>): Promise<void> {
    const { campaignId } = job.data;
    this.logger.log(`Processing campaign #${campaignId}`);

    const em = this.em.fork();

    try {
      const campaign = await em.getRepository(EmCampaign).findOne(campaignId, {
        populate: ['template', 'segments'],
      });

      if (!campaign || !campaign.template) {
        this.logger.error(`Campaign #${campaignId} not found or no template`);
        return;
      }

      if (campaign.status !== EmCampaignStatus.RUNNING) {
        this.logger.warn(
          `Campaign #${campaignId} status is ${campaign.status}, skipping`,
        );
        return;
      }

      // Get SMTP config
      const smtp = await this.configService.getSmtpConfig(em);
      if (!smtp.host) {
        this.logger.error('SMTP not configured, aborting campaign');
        campaign.status = EmCampaignStatus.PAUSED;
        await em.flush();
        return;
      }

      // Collect all contacts from all segments (dedup by email)
      const segmentIds = campaign.segments.getItems().map((s) => s.id);
      const contacts = await em.getRepository(EmContact).find(
        {
          segments: { id: { $in: segmentIds } },
          isSubscribed: true,
        },
        { populate: ['segments'] },
      );

      // Dedup by email
      const uniqueContacts = new Map<string, (typeof contacts)[0]>();
      for (const contact of contacts) {
        if (!uniqueContacts.has(contact.email)) {
          uniqueContacts.set(contact.email, contact);
        }
      }

      this.logger.log(
        `Campaign #${campaignId}: ${uniqueContacts.size} unique contacts to send`,
      );

      const fromName = campaign.fromName || smtp.fromName;
      const fromEmail = campaign.fromEmail || smtp.fromEmail;
      let sentCount = 0;
      let failedCount = 0;

      for (const [_email, contact] of uniqueContacts) {
        try {
          // Create email log
          const emailLog = em.create(EmEmailLog, {
            campaign,
            contactId: contact.id,
            contactEmail: contact.email,
            status: EmEmailLogStatus.PENDING,
            openCount: 0,
            clickCount: 0,
            createdAt: new Date(),
          });
          await em.persistAndFlush(emailLog);

          // Compile template with tracking
          const contactData = {
            id: contact.id,
            firstName: contact.firstName || '',
            lastName: contact.lastName || '',
            email: contact.email,
            company: contact.company || '',
            phone: contact.phone || '',
          };

          const compiled = this.compiler.compile(
            campaign.template!.htmlContent,
            campaign.template!.subject,
            contactData,
            emailLog.id,
            campaignId,
            smtp.trackingDomain,
          );

          // Persist tracked links
          for (const link of compiled.trackedLinks) {
            const existing = await em
              .getRepository(EmTrackedLink)
              .findOne({ hash: link.hash });
            if (!existing) {
              const trackedLink = em.create(EmTrackedLink, {
                campaign,
                originalUrl: link.originalUrl,
                hash: link.hash,
                clickCount: 0,
                createdAt: new Date(),
              });
              em.persist(trackedLink);
            }
          }
          await em.flush();

          // Push to mailer queue
          const senderEmail = fromEmail || smtp.user;
          const senderField = fromName
            ? `"${fromName}" <${senderEmail}>`
            : senderEmail;

          await this.mailerQueue.add(
            'mailer-processing',
            {
              to: contact.email,
              subject: compiled.subject,
              body: compiled.html,
              from: senderField,
              logId: emailLog.id,
            },
            {
              attempts: 3,
              backoff: { type: 'fixed', delay: 5000 },
            },
          );

          sentCount++;
        } catch (err) {
          this.logger.error(
            `Failed to queue email for ${contact.email}: ${err}`,
          );
          failedCount++;
        }
      }

      // Update campaign stats
      campaign.totalSent = sentCount;
      campaign.totalFailed = failedCount;
      campaign.status = EmCampaignStatus.COMPLETED;
      campaign.completedAt = new Date();
      await em.flush();

      this.logger.log(
        `Campaign #${campaignId} completed: ${sentCount} sent, ${failedCount} failed`,
      );
    } catch (err) {
      this.logger.error(`Campaign #${campaignId} processing error: ${err}`);
    }
  }
}
