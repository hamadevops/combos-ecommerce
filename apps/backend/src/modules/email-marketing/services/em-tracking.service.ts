import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/mysql';
import {
  EmEmailLog,
  EmEmailLogStatus,
} from 'src/database/entities/email-marketing/em-email-log.entity';
import { EmContact } from 'src/database/entities/email-marketing/em-contact.entity';
import { EmTemplateCompilerService } from './em-template-compiler.service';
import { EmTrackedLink } from 'src/database/entities/email-marketing/em-tracked-link.entity';
import { EmLinkClick } from 'src/database/entities/email-marketing/em-link-click.entity';

@Injectable()
export class EmTrackingService {
  private readonly logger = new Logger(EmTrackingService.name);

  constructor(
    @InjectRepository(EmEmailLog)
    private readonly emailLogRepo: EntityRepository<EmEmailLog>,
    @InjectRepository(EmTrackedLink)
    private readonly trackedLinkRepo: EntityRepository<EmTrackedLink>,
    @InjectRepository(EmContact)
    private readonly contactRepo: EntityRepository<EmContact>,
    private readonly em: EntityManager,
    private readonly compiler: EmTemplateCompilerService,
  ) {}

  async trackOpen(logId: number) {
    try {
      const emailLog = await this.emailLogRepo.findOne(logId, {
        populate: ['campaign'],
      });
      if (emailLog) {
        emailLog.openCount += 1;
        // Only update status and openedAt on first open
        if (emailLog.status !== EmEmailLogStatus.OPENED) {
          emailLog.status = EmEmailLogStatus.OPENED;
          emailLog.openedAt = new Date();
          // Update campaign stats
          if (emailLog.campaign) {
            emailLog.campaign.totalOpened += 1;
          }
        }
        await this.em.flush();
      }
    } catch (err) {
      this.logger.warn(`Open tracking error for logId ${logId}: ${err}`);
    }
  }

  async trackClick(hash: string, logId: number, ip: string, userAgent: string) {
    try {
      const trackedLink = await this.trackedLinkRepo.findOne(
        { hash },
        { populate: ['campaign'] },
      );
      if (!trackedLink) {
        return null;
      }

      // Record click
      trackedLink.clickCount += 1;

      const emailLog = await this.emailLogRepo.findOne(logId, {
        populate: ['campaign'],
      });
      if (emailLog) {
        // Increment log level click count
        emailLog.clickCount += 1;

        const click = this.em.create(EmLinkClick, {
          emailLog,
          trackedLink,
          ipAddress: ip,
          userAgent: userAgent,
          clickedAt: new Date(),
        });
        this.em.persist(click);

        // Update campaign click count
        if (emailLog.campaign) {
          emailLog.campaign.totalClicked += 1;
        }
      }

      await this.em.flush();
      return trackedLink.originalUrl;
    } catch (err) {
      this.logger.error(`Click tracking error for hash ${hash}: ${err}`);
      return null;
    }
  }

  async unsubscribe(contactId: number, token: string) {
    if (!this.compiler.verifyUnsubscribeToken(contactId, token)) {
      return { success: false, message: 'Link không hợp lệ' };
    }

    try {
      const contact = await this.contactRepo.findOne(contactId);
      if (contact && contact.isSubscribed) {
        contact.isSubscribed = false;
        contact.unsubscribedAt = new Date();
        await this.em.flush();
      }
      return { success: true };
    } catch (err) {
      this.logger.error(`Unsubscribe error: ${err}`);
      return { success: false, message: 'Lỗi hệ thống' };
    }
  }
}
