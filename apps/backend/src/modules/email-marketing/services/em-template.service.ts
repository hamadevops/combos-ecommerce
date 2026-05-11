import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/mysql';
import { EmTemplate } from 'src/database/entities/email-marketing/em-template.entity';
import { EmContact } from 'src/database/entities/email-marketing/em-contact.entity';
import {
  CreateEmTemplateDto,
  UpdateEmTemplateDto,
  PreviewEmTemplateDto,
  SendTestEmTemplateDto,
} from '../dto/em-template.dto';
import { EmTemplateCompilerService } from './em-template-compiler.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EmConfigService } from './em-config.service';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class EmTemplateService {
  constructor(
    @InjectRepository(EmTemplate)
    private readonly templateRepo: EntityRepository<EmTemplate>,
    @InjectRepository(EmContact)
    private readonly contactRepo: EntityRepository<EmContact>,
    private readonly em: EntityManager,
    private readonly compiler: EmTemplateCompilerService,
    private readonly configService: EmConfigService,
    @InjectQueue('mailer-processing')
    private readonly mailerQueue: Queue,
  ) {}

  async findAll(query: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 20, search } = query;
    const offset = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.$or = [
        { name: { $like: `%${search}%` } },
        { subject: { $like: `%${search}%` } },
      ];
    }

    const [items, total] = await this.templateRepo.findAndCount(where, {
      limit,
      offset,
      orderBy: { createdAt: 'DESC' },
      fields: [
        'id',
        'name',
        'subject',
        'previewText',
        'createdAt',
        'updatedAt',
      ],
    });

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const template = await this.templateRepo.findOne(id);
    if (!template) throw new NotFoundException(`Template #${id} không tồn tại`);
    return template;
  }

  async create(dto: CreateEmTemplateDto) {
    const template = this.em.create(EmTemplate, {
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.em.persistAndFlush(template);
    return template;
  }

  async update(id: number, dto: UpdateEmTemplateDto) {
    const template = await this.templateRepo.findOne(id);
    if (!template) throw new NotFoundException(`Template #${id} không tồn tại`);
    this.templateRepo.assign(template, dto);
    await this.em.flush();
    return template;
  }

  async remove(id: number) {
    const template = await this.templateRepo.findOne(id);
    if (!template) throw new NotFoundException(`Template #${id} không tồn tại`);
    await this.em.removeAndFlush(template);
    return { success: true };
  }

  async preview(id: number, dto: PreviewEmTemplateDto) {
    const template = await this.templateRepo.findOne(id);
    if (!template) throw new NotFoundException(`Template #${id} không tồn tại`);

    let contactData: Record<string, any> = dto.sampleData || {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      company: 'Acme Corp',
    };

    if (dto.contactId) {
      const contact = await this.contactRepo.findOne(dto.contactId);
      if (contact) {
        contactData = {
          firstName: contact.firstName || '',
          lastName: contact.lastName || '',
          email: contact.email,
          company: contact.company || '',
          phone: contact.phone || '',
        };
      }
    }

    const renderedHtml = this.compiler.compileForPreview(
      template.htmlContent,
      template.subject,
      contactData,
    );

    return {
      subject: renderedHtml.subject,
      html: renderedHtml.html,
    };
  }

  async duplicate(id: number) {
    const template = await this.templateRepo.findOne(id);
    if (!template) throw new NotFoundException(`Template #${id} không tồn tại`);

    const copy = this.em.create(EmTemplate, {
      name: `${template.name} (Copy)`,
      subject: template.subject,
      htmlContent: template.htmlContent,
      designData: template.designData,
      previewText: template.previewText,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.em.persistAndFlush(copy);
    return copy;
  }

  async sendTest(id: number, dto: SendTestEmTemplateDto) {
    const template = await this.templateRepo.findOne(id);
    if (!template) throw new NotFoundException(`Template #${id} không tồn tại`);

    const smtp = await this.configService.getSmtpConfig();
    if (!smtp.host) throw new BadRequestException('Chưa cấu hình SMTP');

    const sampleContact = {
      firstName: 'Test',
      lastName: 'User',
      email: dto.testEmail,
      company: 'Test Company',
    };

    const compiled = this.compiler.compileForPreview(
      template.htmlContent,
      template.subject,
      sampleContact,
    );

    const fromName = smtp.fromName;
    const fromEmail = smtp.fromEmail;

    const senderEmail = fromEmail || smtp.user;
    const senderField = fromName
      ? `"${fromName}" <${senderEmail}>`
      : senderEmail;

    await this.mailerQueue.add(
      'mailer-processing',
      {
        to: dto.testEmail,
        subject: `[TEST] ${compiled.subject}`,
        body: compiled.html,
        from: senderField,
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
}
