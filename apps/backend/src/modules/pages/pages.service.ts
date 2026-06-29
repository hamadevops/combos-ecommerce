import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { Page } from '../../database/entities/page.entity';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { plainToInstance } from 'class-transformer';
import { PageResponse } from './responses/page.response';
import slugify from 'slugify';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepository: EntityRepository<Page>,
  ) {}

  async create(createPageDto: CreatePageDto): Promise<PageResponse> {
    if (!createPageDto.slug) {
      createPageDto.slug = slugify(createPageDto.title, { lower: true });
    }

    // Check if slug exists
    const existing = await this.pageRepository.findOne({
      slug: createPageDto.slug,
    });
    if (existing) {
      throw new ConflictException('Slug already exists');
    }

    const page = this.pageRepository.create({
      ...createPageDto,
      slug: createPageDto.slug, // Slug is guaranteed to be set above
      type: createPageDto.type ?? 'standard',
      isActive: createPageDto.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.pageRepository.getEntityManager().persistAndFlush(page);
    return plainToInstance(PageResponse, page);
  }

  async findAll(isAdmin: boolean = false): Promise<PageResponse[]> {
    const where = isAdmin ? {} : { isActive: true };
    const pages = await this.pageRepository.find(where);
    return plainToInstance(PageResponse, pages);
  }

  async findOne(idOrSlug: number | string): Promise<PageResponse> {
    let page;
    if (typeof idOrSlug === 'number' || /^\d+$/.test(String(idOrSlug))) {
      page = await this.pageRepository.findOne({ id: Number(idOrSlug) });
    } else {
      page = await this.pageRepository.findOne({ slug: String(idOrSlug) } as any);
    }

    if (!page) {
      throw new NotFoundException(`Page with ID/slug '${idOrSlug}' not found`);
    }
    return plainToInstance(PageResponse, page);
  }

  async findBySlug(slug: string): Promise<PageResponse> {
    const page = await this.pageRepository.findOne({ slug, isActive: true });
    if (!page) {
      throw new NotFoundException(`Page with slug ${slug} not found`);
    }
    return plainToInstance(PageResponse, page);
  }

  async update(
    id: number,
    updatePageDto: UpdatePageDto,
  ): Promise<PageResponse> {
    const page = await this.pageRepository.findOne({ id });
    if (!page) {
      throw new NotFoundException(`Page with ID ${id} not found`);
    }

    if (updatePageDto.slug && updatePageDto.slug !== page.slug) {
      const existing = await this.pageRepository.findOne({
        slug: updatePageDto.slug,
      });
      if (existing) {
        throw new ConflictException('Slug already exists');
      }
    }

    this.pageRepository.assign(page, updatePageDto);
    await this.pageRepository.getEntityManager().flush();
    return plainToInstance(PageResponse, page);
  }

  async remove(id: number): Promise<void> {
    const page = await this.pageRepository.findOne({ id });
    if (!page) {
      throw new NotFoundException(`Page with ID ${id} not found`);
    }

    if (page.type === 'system') {
      throw new ConflictException('System pages cannot be deleted');
    }

    await this.pageRepository.getEntityManager().removeAndFlush(page);
  }
}
