import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, FilterQuery } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/mysql';
import { EmContact } from 'src/database/entities/email-marketing/em-contact.entity';
import { CreateEmContactDto, UpdateEmContactDto } from '../dto/em-contact.dto';

@Injectable()
export class EmContactService {
  constructor(
    @InjectRepository(EmContact)
    private readonly contactRepo: EntityRepository<EmContact>,
    private readonly em: EntityManager,
  ) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    segmentId?: number;
  }) {
    const { page = 1, limit = 20, search, segmentId } = query;
    const offset = (page - 1) * limit;
    const where: FilterQuery<EmContact> = {};

    if (search) {
      where.$or = [
        { email: { $like: `%${search}%` } },
        { firstName: { $like: `%${search}%` } },
        { lastName: { $like: `%${search}%` } },
        { company: { $like: `%${search}%` } },
      ];
    }

    if (segmentId) {
      where.segments = { id: segmentId };
    }

    const [items, total] = await this.contactRepo.findAndCount(where, {
      populate: ['segments'],
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
    const contact = await this.contactRepo.findOne(id, {
      populate: ['segments'],
    });
    if (!contact) throw new NotFoundException(`Contact #${id} không tồn tại`);
    return contact;
  }

  async create(dto: CreateEmContactDto) {
    const existing = await this.contactRepo.findOne({ email: dto.email });
    if (existing) {
      throw new ConflictException(`Email ${dto.email} đã tồn tại`);
    }

    const contact = this.em.create(EmContact, {
      ...dto,
      isSubscribed: dto.isSubscribed ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.em.persistAndFlush(contact);
    return contact;
  }

  async update(id: number, dto: UpdateEmContactDto) {
    const contact = await this.contactRepo.findOne(id);
    if (!contact) throw new NotFoundException(`Contact #${id} không tồn tại`);

    if (dto.email && dto.email !== contact.email) {
      const existing = await this.contactRepo.findOne({ email: dto.email });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Email ${dto.email} đã tồn tại`);
      }
    }

    this.contactRepo.assign(contact, dto);
    await this.em.flush();
    return contact;
  }

  async remove(id: number) {
    const contact = await this.contactRepo.findOne(id);
    if (!contact) throw new NotFoundException(`Contact #${id} không tồn tại`);
    await this.em.removeAndFlush(contact);
    return { success: true };
  }

  async importCsv(
    fileBuffer: Buffer,
  ): Promise<{ imported: number; skipped: number }> {
    const content = fileBuffer.toString('utf-8');
    const lines = content.split('\n').filter((l) => l.trim());

    if (lines.length < 2) {
      return { imported: 0, skipped: 0 };
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const emailIdx = headers.indexOf('email');
    const firstNameIdx = headers.indexOf('firstname');
    const lastNameIdx = headers.indexOf('lastname');
    const phoneIdx = headers.indexOf('phone');
    const companyIdx = headers.indexOf('company');

    if (emailIdx === -1) {
      throw new ConflictException('File CSV phải có cột "email"');
    }

    let imported = 0;
    let skipped = 0;

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim());
      const email = cols[emailIdx];
      if (!email) {
        skipped++;
        continue;
      }

      const existing = await this.contactRepo.findOne({ email });
      if (existing) {
        skipped++;
        continue;
      }

      const contact = this.em.create(EmContact, {
        email,
        firstName: firstNameIdx >= 0 ? cols[firstNameIdx] : undefined,
        lastName: lastNameIdx >= 0 ? cols[lastNameIdx] : undefined,
        phone: phoneIdx >= 0 ? cols[phoneIdx] : undefined,
        company: companyIdx >= 0 ? cols[companyIdx] : undefined,
        isSubscribed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      this.em.persist(contact);
      imported++;
    }

    await this.em.flush();
    return { imported, skipped };
  }
}
