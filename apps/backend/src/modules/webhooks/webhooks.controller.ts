import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { Webhook } from '../../database/entities/webhook.entity';
import { Permissions } from 'src/decorators/permissions.decorator';
import { PermissionEnum } from 'src/libs/enums/permission.enum';

@ApiTags('Webhooks')
@ApiBearerAuth()
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @ApiOperation({ summary: 'Get all webhooks' })
  @ApiResponse({ status: 200, description: 'Return all webhooks.', type: [Webhook] })
  @Permissions(PermissionEnum.WEBHOOK_READ)
  @Get()
  findAll() {
    return this.webhooksService.findAll();
  }

  @ApiOperation({ summary: 'Get a webhook by ID' })
  @ApiResponse({ status: 200, description: 'Return the webhook.', type: Webhook })
  @ApiResponse({ status: 404, description: 'Webhook not found.' })
  @Permissions(PermissionEnum.WEBHOOK_READ)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.webhooksService.findOne(id);
  }

  @ApiOperation({ summary: 'Create a new webhook' })
  @ApiResponse({ status: 201, description: 'The webhook has been successfully created.', type: Webhook })
  @Permissions(PermissionEnum.WEBHOOK_CREATE)
  @Post()
  create(@Body() dto: CreateWebhookDto) {
    return this.webhooksService.create(dto);
  }

  @ApiOperation({ summary: 'Update a webhook' })
  @ApiResponse({ status: 200, description: 'The webhook has been successfully updated.', type: Webhook })
  @ApiResponse({ status: 404, description: 'Webhook not found.' })
  @Permissions(PermissionEnum.WEBHOOK_UPDATE)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateWebhookDto) {
    return this.webhooksService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete a webhook' })
  @ApiResponse({ status: 200, description: 'The webhook has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Webhook not found.' })
  @Permissions(PermissionEnum.WEBHOOK_DELETE)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.webhooksService.remove(id);
  }
}
