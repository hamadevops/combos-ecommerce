import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { Faq } from '../../database/entities/faq.entity';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { plainToInstance } from 'class-transformer';
import { FaqResponse } from './responses/faq.response';

@Injectable()
export class FaqsService {
  constructor(
    @InjectRepository(Faq)
    private readonly faqRepository: EntityRepository<Faq>,
  ) {}

  async create(createFaqDto: CreateFaqDto): Promise<FaqResponse> {
    const faq = this.faqRepository.create({
      ...createFaqDto,
      sortOrder: createFaqDto.sortOrder ?? 0,
      isActive: createFaqDto.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.faqRepository.getEntityManager().persistAndFlush(faq);
    return plainToInstance(FaqResponse, faq);
  }

  async findAll(isAdmin: boolean = false): Promise<FaqResponse[]> {
    const where = isAdmin ? {} : { isActive: true };
    const faqs = await this.faqRepository.find(where, {
      orderBy: { sortOrder: 'ASC' },
    });
    return plainToInstance(FaqResponse, faqs);
  }

  async findOne(id: number): Promise<FaqResponse> {
    const faq = await this.faqRepository.findOne({ id });
    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
    return plainToInstance(FaqResponse, faq);
  }

  async update(id: number, updateFaqDto: UpdateFaqDto): Promise<FaqResponse> {
    const faq = await this.faqRepository.findOne({ id });
    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
    this.faqRepository.assign(faq, updateFaqDto);
    await this.faqRepository.getEntityManager().flush();
    return plainToInstance(FaqResponse, faq);
  }

  async remove(id: number): Promise<void> {
    const faq = await this.faqRepository.findOne({ id });
    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
    await this.faqRepository.getEntityManager().removeAndFlush(faq);
  }
}
