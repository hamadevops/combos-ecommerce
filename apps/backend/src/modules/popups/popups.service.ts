import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, FilterQuery } from '@mikro-orm/mysql';
import { EntityManager } from '@mikro-orm/core';
import { Popup } from '../../database/entities/popup.entity';
import { CreatePopupDto } from './dto/create-popup.dto';
import { UpdatePopupDto } from './dto/update-popup.dto';
import { PopupQueryDto } from './dto/popup-query.dto';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class PopupsService {
  constructor(
    @InjectRepository(Popup)
    private readonly popupRepository: EntityRepository<Popup>,
    private readonly em: EntityManager,
    private readonly uploadService: UploadService,
  ) { }

  async findAll(query: PopupQueryDto) {
    const { page = 1, limit = 10, search, status, position } = query;
    const offset = (page - 1) * limit;

    const where: FilterQuery<Popup> = {};

    if (search) {
      where.$or = [
        { description: { $like: `%${search}%` } },
        { link: { $like: `%${search}%` } },
      ];
    }

    if (status !== undefined) {
      where.status = status;
    }

    if (position) {
      where.position = position;
    }

    const [items, total] = await this.popupRepository.findAndCount(where, {
      limit,
      offset,
      orderBy: { priority: 'ASC', created_at: 'DESC' },
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

  async findActive() {
    const popups = await this.popupRepository.find(
      { status: true },
      {
        orderBy: { priority: 'DESC', created_at: 'DESC' },
      },
    );

    return popups;
  }

  async findOne(id: number) {
    const popup = await this.popupRepository.findOne(id);

    if (!popup) {
      throw new NotFoundException(`Popup with ID ${id} not found`);
    }

    return popup;
  }

  async create(dto: CreatePopupDto, file?: Express.Multer.File) {
    let imageUrl = dto.image_url;

    if (file) {
      imageUrl = await this.uploadService.uploadFile(file, 'popups');
    }

    const popup = this.em.create(Popup, {
      ...dto,
      image_url: imageUrl,
      priority: dto.priority ?? 0,
      status: dto.status ?? true,
      created_at: new Date(),
      updated_at: new Date(),
    });

    await this.em.persistAndFlush(popup);
    return popup;
  }

  async update(id: number, dto: UpdatePopupDto, file?: Express.Multer.File) {
    const popup = await this.popupRepository.findOne(id);

    if (!popup) {
      throw new NotFoundException(`Popup with ID ${id} not found`);
    }

    if (file) {
      const imageUrl = await this.uploadService.uploadFile(file, 'popups');
      // Delete old image if it exists and is local (optional, omitted for safety)
      popup.image_url = imageUrl;
    }

    this.popupRepository.assign(popup, dto);

    // Explicitly handle image_url from DTO if not uploading file (e.g. text input or clearing)
    // But if file is present, it overrides.
    // If DTO has image_url and no file, it updates. 
    // If neither, keep existing (assign handles this if key is missing in dto, but checking explicit nulls helps if needed)

    popup.updated_at = new Date();

    await this.em.flush();
    return popup;
  }

  async remove(id: number) {
    const popup = await this.popupRepository.findOne(id);

    if (!popup) {
      throw new NotFoundException(`Popup with ID ${id} not found`);
    }

    await this.em.removeAndFlush(popup);
    return { success: true };
  }
}
