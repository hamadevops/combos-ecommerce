import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, FilterQuery } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/mysql';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  EmCampaign,
  EmCampaignStatus,
} from 'src/database/entities/email-marketing/em-campaign.entity';
import { EmTemplate } from 'src/database/entities/email-marketing/em-template.entity';
import { EmSegment } from 'src/database/entities/email-marketing/em-segment.entity';
import {
  EmEmailLog,
  EmEmailLogStatus,
} from 'src/database/entities/email-marketing/em-email-log.entity';
import { EmContact } from 'src/database/entities/email-marketing/em-contact.entity';
import {
  CreateEmCampaignDto,
  UpdateEmCampaignDto,
  ScheduleEmCampaignDto,
  SendTestEmCampaignDto,
} from '../dto/em-campaign.dto';
import { EmConfigService } from './em-config.service';
import { EmTemplateCompilerService } from './em-template-compiler.service';

@Injectable()
export class EmCampaignService {
  constructor(
    @InjectRepository(EmCampaign)
    private readonly campaignRepo: EntityRepository<EmCampaign>,
    @InjectRepository(EmTemplate)
    private readonly templateRepo: EntityRepository<EmTemplate>,
    @InjectRepository(EmSegment)
    private readonly segmentRepo: EntityRepository<EmSegment>,
    @InjectRepository(EmEmailLog)
    private readonly emailLogRepo: EntityRepository<EmEmailLog>,
    private readonly em: EntityManager,
    private readonly configService: EmConfigService,
    private readonly compiler: EmTemplateCompilerService,
    @InjectQueue('mailer-processing')
    private readonly mailerQueue: Queue,
  ) {}

  async findAll(query: { page?: number; limit?: number; status?: string }) {
    const { page = 1, limit = 20, status } = query;
    const offset = (page - 1) * limit;
    const where: FilterQuery<EmCampaign> = { deletedAt: null };

    if (status) {
      where.status = status as EmCampaignStatus;
    }

    const [items, total] = await this.campaignRepo.findAndCount(where, {
      populate: ['template', 'segments'],
      limit,
      offset,
      orderBy: { createdAt: 'DESC' },
    });

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const campaign = await this.campaignRepo.findOne(
      { id, deletedAt: null },
      {
        populate: ['template', 'segments'],
      },
    );
    if (!campaign) throw new NotFoundException(`Campaign #${id} không tồn tại`);

    // Calculate segment contact counts and total unique contacts
    const segmentIds = campaign.segments.getItems().map((s) => s.id);
    const uniqueContacts = await this.em.getRepository(EmContact).count({
      segments: { id: { $in: segmentIds } },
      isSubscribed: true,
    });

    // Enforce plain object to add virtual fields
    const result = campaign as any;
    result.totalContacts = uniqueContacts;

    // For each segment, add contactCount
    for (const segment of campaign.segments) {
      (segment as any).contactCount = await this.em
        .getRepository(EmContact)
        .count({
          segments: segment.id,
        });
    }

    return result;
  }

  async create(dto: CreateEmCampaignDto) {
    const template = await this.templateRepo.findOne(dto.templateId);
    if (!template)
      throw new NotFoundException(`Template #${dto.templateId} không tồn tại`);

    const segments = await this.segmentRepo.find({
      id: { $in: dto.segmentIds },
    });
    if (segments.length === 0)
      throw new BadRequestException('Cần chọn ít nhất 1 segment');

    const campaign = this.em.create(EmCampaign, {
      name: dto.name,
      template,
      fromName: dto.fromName,
      fromEmail: dto.fromEmail,
      status: EmCampaignStatus.DRAFT,
      totalSent: 0,
      totalFailed: 0,
      totalOpened: 0,
      totalClicked: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    for (const segment of segments) {
      campaign.segments.add(segment);
    }

    await this.em.persistAndFlush(campaign);
    return campaign;
  }

  async update(id: number, dto: UpdateEmCampaignDto) {
    const campaign = await this.campaignRepo.findOne(id, {
      populate: ['segments'],
    });
    if (!campaign) throw new NotFoundException(`Campaign #${id} không tồn tại`);

    if (dto.name) campaign.name = dto.name;
    if (dto.fromName !== undefined) campaign.fromName = dto.fromName;
    if (dto.fromEmail !== undefined) campaign.fromEmail = dto.fromEmail;
    if (dto.status !== undefined) campaign.status = dto.status;

    if (dto.templateId) {
      const template = await this.templateRepo.findOne(dto.templateId);
      if (!template)
        throw new NotFoundException(
          `Template #${dto.templateId} không tồn tại`,
        );
      campaign.template = template;
    }

    if (dto.segmentIds) {
      campaign.segments.removeAll();
      const segments = await this.segmentRepo.find({
        id: { $in: dto.segmentIds },
      });
      for (const segment of segments) {
        campaign.segments.add(segment);
      }
    }

    await this.em.flush();
    return campaign;
  }

  async remove(id: number) {
    const campaign = await this.campaignRepo.findOne(id);
    if (!campaign) throw new NotFoundException(`Campaign #${id} không tồn tại`);

    if (
      ![
        EmCampaignStatus.DRAFT,
        EmCampaignStatus.CANCELLED,
        EmCampaignStatus.COMPLETED,
      ].includes(campaign.status)
    ) {
      throw new BadRequestException(
        'Chỉ có thể xóa campaign ở trạng thái DRAFT, CANCELLED hoặc COMPLETED',
      );
    }

    campaign.deletedAt = new Date();
    await this.em.flush();
    return { success: true };
  }

  async schedule(id: number, dto: ScheduleEmCampaignDto) {
    const campaign = await this.campaignRepo.findOne(id, {
      populate: ['template', 'segments'],
    });
    if (!campaign) throw new NotFoundException(`Campaign #${id} không tồn tại`);

    if (campaign.status !== EmCampaignStatus.DRAFT) {
      throw new BadRequestException(
        'Chỉ có thể đặt lịch cho campaign ở trạng thái DRAFT',
      );
    }

    if (!campaign.template) {
      throw new BadRequestException('Campaign cần có template');
    }

    if (campaign.segments.count() === 0) {
      throw new BadRequestException('Campaign cần có ít nhất 1 segment');
    }

    campaign.scheduledAt = new Date(dto.scheduledAt);
    campaign.status = EmCampaignStatus.SCHEDULED;
    await this.em.flush();
    return campaign;
  }

  async cancel(id: number) {
    const campaign = await this.campaignRepo.findOne(id);
    if (!campaign) throw new NotFoundException(`Campaign #${id} không tồn tại`);

    if (
      ![EmCampaignStatus.SCHEDULED, EmCampaignStatus.RUNNING].includes(
        campaign.status,
      )
    ) {
      throw new BadRequestException(
        'Chỉ có thể hủy campaign SCHEDULED hoặc RUNNING',
      );
    }

    campaign.status = EmCampaignStatus.CANCELLED;
    await this.em.flush();
    return campaign;
  }

  async sendTest(id: number, dto: SendTestEmCampaignDto) {
    const campaign = await this.campaignRepo.findOne(id, {
      populate: ['template'],
    });
    if (!campaign) throw new NotFoundException(`Campaign #${id} không tồn tại`);
    if (!campaign.template)
      throw new BadRequestException('Campaign cần có template');

    const smtp = await this.configService.getSmtpConfig();
    if (!smtp.host) throw new BadRequestException('Chưa cấu hình SMTP');

    const sampleContact = {
      firstName: 'Test',
      lastName: 'User',
      email: dto.testEmail,
      company: 'Test Company',
    };

    const compiled = this.compiler.compileForPreview(
      campaign.template.htmlContent,
      campaign.template.subject,
      sampleContact,
    );

    const fromName = campaign.fromName || smtp.fromName;
    const fromEmail = campaign.fromEmail || smtp.fromEmail;

    await this.mailerQueue.add(
      'mailer-processing',
      {
        to: dto.testEmail,
        subject: `[TEST] ${compiled.subject}`,
        body: compiled.html,
        from: `"${fromName}" <${fromEmail}>`,
      },
      {
        attempts: 3,
        backoff: { type: 'fixed', delay: 5000 },
      },
    );

    return {
      success: true,
      message: `Email test đã đưa vào hàng đợi cho ${dto.testEmail}`,
    };
  }

  async getLogs(
    campaignId: number,
    query: { page?: number; limit?: number; status?: string },
  ) {
    const { page = 1, limit = 50, status } = query;
    const offset = (page - 1) * limit;
    const where: FilterQuery<EmEmailLog> = { campaign: campaignId };

    if (status) {
      where.status = status as EmEmailLogStatus;
    }

    const [items, total] = await this.emailLogRepo.findAndCount(where, {
      limit,
      offset,
      orderBy: { createdAt: 'DESC' },
    });

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
