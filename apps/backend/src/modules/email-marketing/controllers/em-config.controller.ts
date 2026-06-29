import { Controller, Get, Put, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { EmConfigService } from '../services/em-config.service';
import { UpdateEmConfigDto, TestEmConfigDto } from '../dto/em-config.dto';
import { Permissions } from 'src/decorators/permissions.decorator';
import { PermissionEnum } from 'src/libs/enums/permission.enum';
import { EmMessageResponseDto } from '../dto/em-responses.dto';
import { EmConfigItemDto } from '../dto/em-config.dto';

@ApiTags('Email Marketing - Config')
@ApiBearerAuth()
@Controller('email-marketing/config')
export class EmConfigController {
  constructor(private readonly configService: EmConfigService) {}

  @ApiOperation({ summary: 'Lấy tất cả cấu hình SMTP' })
  @Permissions(PermissionEnum.EMAIL_MARKETING_READ)
  @ApiOkResponse({ type: [EmConfigItemDto] })
  @Get()
  findAll() {
    return this.configService.findAll();
  }

  @ApiOperation({ summary: 'Cập nhật hàng loạt cấu hình SMTP' })
  @Permissions(PermissionEnum.EMAIL_MARKETING_UPDATE)
  @ApiOkResponse({ type: EmMessageResponseDto })
  @Put()
  updateBatch(@Body() dto: UpdateEmConfigDto) {
    return this.configService.updateBatch(dto);
  }

  @ApiOperation({ summary: 'Gửi email test với cấu hình SMTP hiện tại' })
  @Permissions(PermissionEnum.EMAIL_MARKETING_UPDATE)
  @ApiCreatedResponse({ type: EmMessageResponseDto })
  @Post('test')
  sendTest(@Body() dto: TestEmConfigDto) {
    return this.configService.sendTestEmail(dto);
  }
}
