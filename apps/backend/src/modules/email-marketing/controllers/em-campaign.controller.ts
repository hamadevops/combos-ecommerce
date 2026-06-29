import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { EmCampaignService } from '../services/em-campaign.service';
import {
  CreateEmCampaignDto,
  UpdateEmCampaignDto,
  ScheduleEmCampaignDto,
  SendTestEmCampaignDto,
} from '../dto/em-campaign.dto';
import { Permissions } from 'src/decorators/permissions.decorator';
import { PermissionEnum } from 'src/libs/enums/permission.enum';
import {
  EmCampaignDto,
  EmCampaignListResponseDto,
  EmMessageResponseDto,
  EmCampaignLogListResponseDto,
} from '../dto/em-responses.dto';

@ApiTags('Email Marketing - Campaigns')
@ApiBearerAuth()
@Controller('email-marketing/campaigns')
export class EmCampaignController {
  constructor(private readonly campaignService: EmCampaignService) {}

  @ApiOperation({ summary: 'Danh sách campaigns' })
  @Permissions(PermissionEnum.EMAIL_MARKETING_READ)
  @ApiOkResponse({ type: EmCampaignListResponseDto })
  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.campaignService.findAll({ page, limit, status });
  }

  @ApiOperation({ summary: 'Chi tiết campaign + stats' })
  @Permissions(PermissionEnum.EMAIL_MARKETING_READ)
  @ApiOkResponse({ type: EmCampaignDto })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.campaignService.findOne(id);
  }

  @ApiOperation({ summary: 'Tạo campaign (DRAFT)' })
  @Permissions(PermissionEnum.EMAIL_MARKETING_CREATE)
  @ApiCreatedResponse({ type: EmCampaignDto })
  @Post()
  create(@Body() dto: CreateEmCampaignDto) {
    return this.campaignService.create(dto);
  }

  @ApiOperation({ summary: 'Cập nhật campaign' })
  @Permissions(PermissionEnum.EMAIL_MARKETING_UPDATE)
  @ApiOkResponse({ type: EmCampaignDto })
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmCampaignDto,
  ) {
    return this.campaignService.update(id, dto);
  }

  @ApiOperation({ summary: 'Xóa campaign (chỉ DRAFT/CANCELLED)' })
  @Permissions(PermissionEnum.EMAIL_MARKETING_DELETE)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.campaignService.remove(id);
  }

  @ApiOperation({ summary: 'Đặt lịch gửi campaign' })
  @Permissions(PermissionEnum.EMAIL_MARKETING_UPDATE)
  @Post(':id/schedule')
  schedule(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ScheduleEmCampaignDto,
  ) {
    return this.campaignService.schedule(id, dto);
  }

  @ApiOperation({ summary: 'Hủy campaign' })
  @Permissions(PermissionEnum.EMAIL_MARKETING_UPDATE)
  @ApiCreatedResponse({ type: EmMessageResponseDto })
  @Post(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.campaignService.cancel(id);
  }

  @ApiOperation({ summary: 'Gửi email test' })
  @Permissions(PermissionEnum.EMAIL_MARKETING_UPDATE)
  @Post(':id/send-test')
  sendTest(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SendTestEmCampaignDto,
  ) {
    return this.campaignService.sendTest(id, dto);
  }

  @ApiOperation({ summary: 'Danh sách email logs của campaign' })
  @Permissions(PermissionEnum.EMAIL_MARKETING_READ)
  @ApiOkResponse({ type: EmCampaignLogListResponseDto })
  @Get(':id/logs')
  getLogs(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.campaignService.getLogs(id, { page, limit, status });
  }
}
