import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { EmSegmentService } from '../services/em-segment.service';
import {
  CreateEmSegmentDto,
  UpdateEmSegmentDto,
  AssignContactsDto,
} from '../dto/em-segment.dto';
import { Permissions } from 'src/decorators/permissions.decorator';
import { PermissionEnum } from 'src/libs/enums/permission.enum';
import {
  EmSegmentDto,
  EmSegmentListResponseDto,
} from '../dto/em-responses.dto';

@ApiTags('Email Marketing - Segments')
@ApiBearerAuth()
@Controller('email-marketing/segments')
export class EmSegmentController {
  constructor(private readonly segmentService: EmSegmentService) {}

  @ApiOperation({ summary: 'Danh sách segments' })
  @Permissions(PermissionEnum.EMAIL_MARKETING_READ)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiOkResponse({ type: EmSegmentListResponseDto })
  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.segmentService.findAll({ page, limit, search });
  }

  @ApiOperation({ summary: 'Chi tiết segment + contacts' })
  @Permissions(PermissionEnum.EMAIL_MARKETING_READ)
  @ApiOkResponse({ type: EmSegmentDto })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.segmentService.findOne(id);
  }

  @ApiOperation({ summary: 'Tạo segment' })
  @Permissions(PermissionEnum.EMAIL_MARKETING_CREATE)
  @ApiCreatedResponse({ type: EmSegmentDto })
  @Post()
  create(@Body() dto: CreateEmSegmentDto) {
    return this.segmentService.create(dto);
  }

  @ApiOperation({ summary: 'Cập nhật segment' })
  @Permissions(PermissionEnum.EMAIL_MARKETING_UPDATE)
  @ApiOkResponse({ type: EmSegmentDto })
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmSegmentDto,
  ) {
    return this.segmentService.update(id, dto);
  }

  @ApiOperation({ summary: 'Xóa segment' })
  @Permissions(PermissionEnum.EMAIL_MARKETING_DELETE)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.segmentService.remove(id);
  }

  @ApiOperation({ summary: 'Gán contacts vào segment' })
  @Permissions(PermissionEnum.EMAIL_MARKETING_UPDATE)
  @Post(':id/contacts')
  assignContacts(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignContactsDto,
  ) {
    return this.segmentService.assignContacts(id, dto.contactIds);
  }

  @ApiOperation({ summary: 'Gỡ contacts khỏi segment' })
  @Permissions(PermissionEnum.EMAIL_MARKETING_UPDATE)
  @Delete(':id/contacts')
  removeContacts(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignContactsDto,
  ) {
    return this.segmentService.removeContacts(id, dto.contactIds);
  }
}
