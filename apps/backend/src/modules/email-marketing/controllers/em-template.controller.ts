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
import { EmTemplateService } from '../services/em-template.service';
import {
  CreateEmTemplateDto,
  UpdateEmTemplateDto,
  PreviewEmTemplateDto,
  SendTestEmTemplateDto,
} from '../dto/em-template.dto';
import { Permissions } from 'src/decorators/permissions.decorator';
import { PermissionEnum } from 'src/libs/enums/permission.enum';
import {
  EmTemplateDto,
  EmTemplateListResponseDto,
} from '../dto/em-responses.dto';

@ApiTags('Email Marketing - Templates')
@ApiBearerAuth()
@Controller('email-marketing/templates')
export class EmTemplateController {
  constructor(private readonly templateService: EmTemplateService) {}

  @ApiOperation({ summary: 'Danh sách templates' })
  @Permissions(PermissionEnum.EMAIL_MARKETING_READ)
  @ApiOkResponse({ type: EmTemplateListResponseDto })
  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.templateService.findAll({ page, limit, search });
  }

  @ApiOperation({ summary: 'Chi tiết template (kèm designData)' })
  @Permissions(PermissionEnum.EMAIL_MARKETING_READ)
  @ApiOkResponse({ type: EmTemplateDto })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.templateService.findOne(id);
  }

  @ApiOperation({ summary: 'Tạo template' })
  @Permissions(PermissionEnum.EMAIL_MARKETING_CREATE)
  @ApiCreatedResponse({ type: EmTemplateDto })
  @Post()
  create(@Body() dto: CreateEmTemplateDto) {
    return this.templateService.create(dto);
  }

  @ApiOperation({ summary: 'Cập nhật template' })
  @Permissions(PermissionEnum.EMAIL_MARKETING_UPDATE)
  @ApiOkResponse({ type: EmTemplateDto })
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmTemplateDto,
  ) {
    return this.templateService.update(id, dto);
  }

  @ApiOperation({ summary: 'Xóa template' })
  @Permissions(PermissionEnum.EMAIL_MARKETING_DELETE)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.templateService.remove(id);
  }

  @ApiOperation({ summary: 'Preview template với sample data' })
  @Permissions(PermissionEnum.EMAIL_MARKETING_READ)
  @Post(':id/preview')
  preview(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PreviewEmTemplateDto,
  ) {
    return this.templateService.preview(id, dto);
  }

  @ApiOperation({ summary: 'Nhân bản template' })
  @Permissions(PermissionEnum.EMAIL_MARKETING_CREATE)
  @ApiCreatedResponse({ type: EmTemplateDto })
  @Post(':id/duplicate')
  duplicate(@Param('id', ParseIntPipe) id: number) {
    return this.templateService.duplicate(id);
  }

  @ApiOperation({ summary: 'Gửi email test' })
  @Permissions(PermissionEnum.EMAIL_MARKETING_CREATE)
  @Post(':id/send-test')
  sendTest(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SendTestEmTemplateDto,
  ) {
    return this.templateService.sendTest(id, dto);
  }
}
