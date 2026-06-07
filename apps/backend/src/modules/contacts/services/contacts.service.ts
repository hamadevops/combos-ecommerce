import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, FilterQuery } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/mysql';
import { Contact, ContactType, ContactStatus } from '../../../database/entities/contact.entity';
import { SubmitNewsletterDto, SubmitContactFormDto, UpdateContactStatusDto, CreateContactDto, UpdateContactDto } from '../dto/contact.dto';
import { WebhooksService } from '../../webhooks/webhooks.service';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepo: EntityRepository<Contact>,
    private readonly em: EntityManager,
    private readonly webhooksService: WebhooksService,
  ) {}

  async submitNewsletter(dto: SubmitNewsletterDto) {
    const existing = await this.contactRepo.findOne({ email: dto.email, type: ContactType.NEWSLETTER });
    if (existing) {
      // Idempotent: return success if already subscribed
      return existing;
    }

    const contact = this.em.create(Contact, {
      email: dto.email,
      type: ContactType.NEWSLETTER,
      status: ContactStatus.UNREAD,
      metadata: dto.metadata,
      utmSource: dto.utmSource,
      utmMedium: dto.utmMedium,
      utmCampaign: dto.utmCampaign,
      utmTerm: dto.utmTerm,
      utmContent: dto.utmContent,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    await this.em.persistAndFlush(contact);

    // Dispatch webhook
    this.webhooksService.dispatch('newsletter.subscribed', contact).catch(err => {
      console.error('Failed to dispatch webhook for newsletter.subscribed', err);
    });

    return contact;
  }

  async submitContactForm(dto: SubmitContactFormDto) {
    const contact = this.em.create(Contact, {
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      message: dto.message,
      type: ContactType.CONTACT_FORM,
      status: ContactStatus.UNREAD,
      metadata: dto.metadata,
      utmSource: dto.utmSource,
      utmMedium: dto.utmMedium,
      utmCampaign: dto.utmCampaign,
      utmTerm: dto.utmTerm,
      utmContent: dto.utmContent,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.em.persistAndFlush(contact);

    // Dispatch webhook
    this.webhooksService.dispatch('contact.submitted', contact).catch(err => {
      console.error('Failed to dispatch webhook for contact.submitted', err);
    });

    return contact;
  }

  async findAll(query: { page?: number; limit?: number; search?: string; type?: ContactType; status?: ContactStatus }) {
    const { page = 1, limit = 20, search, type, status } = query;
    const offset = (page - 1) * limit;
    const where: FilterQuery<Contact> = {};

    if (search) {
      where.$or = [
        { email: { $like: `%${search}%` } },
        { name: { $like: `%${search}%` } },
      ];
    }
    if (type) {
      where.type = type;
    }
    if (status) {
      where.status = status;
    }

    const [items, total] = await this.contactRepo.findAndCount(where, {
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
    const contact = await this.contactRepo.findOne(id);
    if (!contact) throw new NotFoundException(`Contact #${id} not found`);
    return contact;
  }

  async updateStatus(id: number, dto: UpdateContactStatusDto) {
    const contact = await this.findOne(id);
    this.contactRepo.assign(contact, { status: dto.status });
    await this.em.flush();
    return contact;
  }

  async create(dto: CreateContactDto) {
    const contact = this.em.create(Contact, {
      ...dto,
      status: dto.status || ContactStatus.UNREAD,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.em.persistAndFlush(contact);
    return contact;
  }

  async update(id: number, dto: UpdateContactDto) {
    const contact = await this.findOne(id);
    this.contactRepo.assign(contact, { ...dto, updatedAt: new Date() });
    await this.em.flush();
    return contact;
  }

  async exportCsv(query: { search?: string; type?: ContactType; status?: ContactStatus }): Promise<string> {
    const where: FilterQuery<Contact> = {};

    if (query.search) {
      where.$or = [
        { email: { $like: `%${query.search}%` } },
        { name: { $like: `%${query.search}%` } },
      ];
    }
    if (query.type) {
      where.type = query.type;
    }
    if (query.status) {
      where.status = query.status;
    }

    const items = await this.contactRepo.find(where, {
      orderBy: { createdAt: 'DESC' },
    });

    const headers = [
      'ID',
      'Name',
      'Email',
      'Phone',
      'Type',
      'Status',
      'Message',
      'Source',
      'Medium',
      'Campaign',
      'Term',
      'Content',
      'Created At'
    ];

    const escapeCsv = (str: any) => {
      if (str == null) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = items.map(item => [
      item.id,
      escapeCsv(item.name),
      escapeCsv(item.email),
      escapeCsv(item.phone),
      item.type,
      item.status,
      escapeCsv(item.message),
      escapeCsv(item.utmSource),
      escapeCsv(item.utmMedium),
      escapeCsv(item.utmCampaign),
      escapeCsv(item.utmTerm),
      escapeCsv(item.utmContent),
      item.createdAt.toISOString()
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }

  async remove(id: number) {
    const contact = await this.findOne(id);
    await this.em.removeAndFlush(contact);
    return { success: true };
  }
}
