import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { AppFeedback } from '../../database/entities/app-feedback.entity';
import { CreateAppFeedbackDto } from './dto/create-app-feedback.dto';
import { UpdateAppFeedbackDto } from './dto/update-app-feedback.dto';
import { EntityManager } from '@mikro-orm/mysql';

@Injectable()
export class AppFeedbacksService {
  constructor(
    @InjectRepository(AppFeedback)
    private readonly appFeedbackRepository: EntityRepository<AppFeedback>,
    private readonly em: EntityManager,
  ) {}

  async create(createDto: CreateAppFeedbackDto) {
    const feedback = this.appFeedbackRepository.create({
      rating: createDto.rating ?? 5,
      isActive: createDto.isActive ?? true,
      sortOrder: createDto.sortOrder ?? 0,
      customerName: createDto.customerName,
      customerAvatar: createDto.customerAvatar,
      content: createDto.content,
      image: createDto.image,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.em.persistAndFlush(feedback);
    return feedback;
  }

  async findAll(query: { isActive?: boolean; page?: number; limit?: number }) {
    const where: any = {};
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const page = query.page || 1;
    const limit = query.limit || 10;

    const [items, total] = await this.appFeedbackRepository.findAndCount(where, {
      orderBy: { sortOrder: 'ASC', createdAt: 'DESC' },
      limit,
      offset: (page - 1) * limit,
    });

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const feedback = await this.appFeedbackRepository.findOne(id);
    if (!feedback) {
      throw new NotFoundException('App feedback not found');
    }
    return feedback;
  }

  async update(id: number, updateDto: UpdateAppFeedbackDto) {
    const feedback = await this.findOne(id);
    this.appFeedbackRepository.assign(feedback, {
      ...updateDto,
      updatedAt: new Date(),
    });
    await this.em.flush();
    return feedback;
  }

  async remove(id: number) {
    const feedback = await this.findOne(id);
    await this.em.removeAndFlush(feedback);
    return { message: 'App feedback deleted successfully' };
  }
}
