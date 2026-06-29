import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { Setting } from '../../database/entities/setting.entity';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { plainToInstance } from 'class-transformer';
import { SettingResponse } from './responses/setting.response';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: EntityRepository<Setting>,
  ) {}

  async create(createSettingDto: CreateSettingDto): Promise<SettingResponse> {
    const existing = await this.settingRepository.findOne({
      key: createSettingDto.key,
    });
    if (existing) {
      throw new ConflictException(
        `Setting with key ${createSettingDto.key} already exists`,
      );
    }

    const setting = this.settingRepository.create({
      ...createSettingDto,
      type: createSettingDto.type ?? 'string',
      group: createSettingDto.group ?? 'general',
      isPublic: createSettingDto.isPublic ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.settingRepository.getEntityManager().persistAndFlush(setting);
    return plainToInstance(SettingResponse, setting);
  }

  async findAll(isAdmin: boolean = false): Promise<SettingResponse[]> {
    const where = isAdmin ? {} : { isPublic: true };
    const settings = await this.settingRepository.find(where);
    return plainToInstance(SettingResponse, settings);
  }

  async findOne(id: number): Promise<SettingResponse> {
    const setting = await this.settingRepository.findOne({ id });
    if (!setting) {
      throw new NotFoundException(`Setting with ID ${id} not found`);
    }
    return plainToInstance(SettingResponse, setting);
  }

  async getPublicSettings(): Promise<any> {
    const settings = await this.settingRepository.find({ isPublic: true });
    const result: Record<string, any> = {};
    settings.forEach((s) => {
      result[s.key] = s.value;
    });
    return result;
  }

  async update(
    id: number,
    updateSettingDto: UpdateSettingDto,
  ): Promise<SettingResponse> {
    const setting = await this.settingRepository.findOne({ id });
    if (!setting) {
      throw new NotFoundException(`Setting with ID ${id} not found`);
    }
    this.settingRepository.assign(setting, updateSettingDto);
    await this.settingRepository.getEntityManager().flush();
    return plainToInstance(SettingResponse, setting);
  }

  async updateByKey(
    key: string,
    updateSettingDto: UpdateSettingDto,
  ): Promise<SettingResponse> {
    const setting = await this.settingRepository.findOne({ key });
    if (!setting) {
      throw new NotFoundException(`Setting with key ${key} not found`);
    }
    this.settingRepository.assign(setting, updateSettingDto);
    await this.settingRepository.getEntityManager().flush();
    return plainToInstance(SettingResponse, setting);
  }

  async remove(id: number): Promise<void> {
    const setting = await this.settingRepository.findOne({ id });
    if (!setting) {
      throw new NotFoundException(`Setting with ID ${id} not found`);
    }
    await this.settingRepository.getEntityManager().removeAndFlush(setting);
  }
}
