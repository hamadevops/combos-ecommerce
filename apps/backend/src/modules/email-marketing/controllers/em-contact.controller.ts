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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { EmContactService } from '../services/em-contact.service';
import { CreateEmContactDto, UpdateEmContactDto } from '../dto/em-contact.dto';
import { Permissions } from 'src/decorators/permissions.decorator';
import { PermissionEnum } from 'src/libs/enums/permission.enum';
import {
  EmContactDto,
  EmContactListResponseDto,
  EmImportResponseDto,
} from '../dto/em-responses.dto';

@ApiTags('Email Marketing - Contacts')
@ApiBearerAuth()
@Controller('email-marketing/contacts')
export class EmContactController {
  constructor(private readonly contactService: EmContactService) {}

  @ApiOperation({ summary: 'Danh sách contacts' })
  @Permissions(PermissionEnum.EMAIL_MARKETING_READ)
  @ApiOkResponse({ type: EmContactListResponseDto })
  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('segmentId') segmentId?: number,
  ) {
    return this.contactService.findAll({ page, limit, search, segmentId });
  }

  @ApiOperation({ summary: 'Chi tiết contact' })
  @Permissions(PermissionEnum.EMAIL_MARKETING_READ)
  @ApiOkResponse({ type: EmContactDto })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contactService.findOne(id);
  }

  @ApiOperation({ summary: 'Tạo contact' })
  @Permissions(PermissionEnum.EMAIL_MARKETING_CREATE)
  @ApiCreatedResponse({ type: EmContactDto })
  @Post()
  create(@Body() dto: CreateEmContactDto) {
    return this.contactService.create(dto);
  }

  @ApiOperation({ summary: 'Cập nhật contact' })
  @Permissions(PermissionEnum.EMAIL_MARKETING_UPDATE)
  @ApiOkResponse({ type: EmContactDto })
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmContactDto,
  ) {
    return this.contactService.update(id, dto);
  }

  @ApiOperation({ summary: 'Xóa contact' })
  @Permissions(PermissionEnum.EMAIL_MARKETING_DELETE)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.contactService.remove(id);
  }

  @ApiOperation({ summary: 'Import contacts từ CSV' })
  @Permissions(PermissionEnum.EMAIL_MARKETING_CREATE)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiOkResponse({ type: EmImportResponseDto })
  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(@UploadedFile() file: Express.Multer.File) {
    return this.contactService.importCsv(file.buffer);
  }
}
