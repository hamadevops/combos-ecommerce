import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/mysql';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Webhook } from '../../database/entities/webhook.entity';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';

import { EntityManager, wrap } from '@mikro-orm/core';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    @InjectRepository(Webhook)
    private readonly webhookRepository: EntityRepository<Webhook>,
    private readonly em: EntityManager,
    private readonly httpService: HttpService,
  ) {}

  async findAll() {
    return this.webhookRepository.findAll();
  }

  async findOne(id: number) {
    const webhook = await this.webhookRepository.findOne(id);
    if (!webhook) {
      throw new NotFoundException(`Webhook with ID ${id} not found`);
    }
    return webhook;
  }

  async create(dto: CreateWebhookDto) {
    const webhook = this.webhookRepository.create({
      ...dto,
      method: 'POST',
      isEnabled: dto.isEnabled ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.em.persistAndFlush(webhook);
    return webhook;
  }

  async update(id: number, dto: UpdateWebhookDto) {
    const webhook = await this.findOne(id);
    this.webhookRepository.assign(webhook, dto);
    await this.em.flush();
    return webhook;
  }

  async remove(id: number) {
    const webhook = await this.findOne(id);
    await this.em.removeAndFlush(webhook);
    return { success: true };
  }

  async dispatch(eventName: string, data: any) {
    const webhooks = await this.webhookRepository.find({ isEnabled: true });
    
    // Ensure w.events exists and works if it's an array or string
    const matchedWebhooks = webhooks.filter(w => {
      if (!w.events) return false;
      if (Array.isArray(w.events)) return w.events.includes(eventName);
      if (typeof w.events === 'string') return (w.events as string).includes(eventName);
      return false;
    });

    if (matchedWebhooks.length === 0) {
      return;
    }

    let serializedData = data;
    if (data && typeof data === 'object') {
      try {
        serializedData = wrap(data).toJSON();
      } catch (err) {
        // Not a MikroORM entity, fallback to original data
        serializedData = data;
      }
    }

    const payload = {
      event: eventName,
      data: serializedData,
      timestamp: new Date().toISOString(),
    };

    for (const webhook of matchedWebhooks) {
      this.logger.log(`Dispatching event ${eventName} to webhook: ${webhook.url}`);
      try {
        await firstValueFrom(
          this.httpService.post(webhook.url, payload, {
            headers: webhook.headers || {},
          }),
        );
        this.logger.log(`Webhook ${webhook.id} success`);
      } catch (error: any) {
        this.logger.error(`Webhook ${webhook.id} failed: ${error.message}`);
      }
    }
  }
}
