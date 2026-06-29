import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/mysql';
import { EmSegment } from 'src/database/entities/email-marketing/em-segment.entity';
import { EmContact } from 'src/database/entities/email-marketing/em-contact.entity';
import { CreateEmSegmentDto, UpdateEmSegmentDto } from '../dto/em-segment.dto';

@Injectable()
export class EmSegmentService {
  constructor(
    @InjectRepository(EmSegment)
    private readonly segmentRepo: EntityRepository<EmSegment>,
    @InjectRepository(EmContact)
    private readonly contactRepo: EntityRepository<EmContact>,
    private readonly em: EntityManager,
  ) {}

  async findAll(query: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 20, search } = query;
    const offset = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.name = { $like: `%${search}%` };
    }

    const [items, total] = await this.segmentRepo.findAndCount(where, {
      populate: ['contacts'],
      limit,
      offset,
      orderBy: { createdAt: 'DESC' },
    });

    const mappedItems = items.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      contactCount: s.contacts.count(),
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));

    return {
      items: mappedItems,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const segment = await this.segmentRepo.findOne(id, {
      populate: ['contacts'],
    });
    if (!segment) throw new NotFoundException(`Segment #${id} không tồn tại`);
    return segment;
  }

  async create(dto: CreateEmSegmentDto) {
    const segment = this.em.create(EmSegment, {
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.em.persistAndFlush(segment);
    return segment;
  }

  async update(id: number, dto: UpdateEmSegmentDto) {
    const segment = await this.segmentRepo.findOne(id);
    if (!segment) throw new NotFoundException(`Segment #${id} không tồn tại`);
    this.segmentRepo.assign(segment, dto);
    await this.em.flush();
    return segment;
  }

  async remove(id: number) {
    const segment = await this.segmentRepo.findOne(id);
    if (!segment) throw new NotFoundException(`Segment #${id} không tồn tại`);
    await this.em.removeAndFlush(segment);
    return { success: true };
  }

  async assignContacts(segmentId: number, contactIds: number[]) {
    const segment = await this.segmentRepo.findOne(segmentId, {
      populate: ['contacts'],
    });
    if (!segment)
      throw new NotFoundException(`Segment #${segmentId} không tồn tại`);

    const contacts = await this.contactRepo.find({ id: { $in: contactIds } });
    for (const contact of contacts) {
      if (!segment.contacts.contains(contact)) {
        segment.contacts.add(contact);
      }
    }
    await this.em.flush();
    return { success: true, added: contacts.length };
  }

  async removeContacts(segmentId: number, contactIds: number[]) {
    const segment = await this.segmentRepo.findOne(segmentId, {
      populate: ['contacts'],
    });
    if (!segment)
      throw new NotFoundException(`Segment #${segmentId} không tồn tại`);

    const contacts = await this.contactRepo.find({ id: { $in: contactIds } });
    for (const contact of contacts) {
      segment.contacts.remove(contact);
    }
    await this.em.flush();
    return { success: true, removed: contacts.length };
  }
}
