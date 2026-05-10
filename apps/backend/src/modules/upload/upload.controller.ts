import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiOkResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { UploadUrlDto } from './dto/upload-url.dto';
import { AppSwaggerTag } from '../swagger/swagger.constant';
import { Permissions } from 'src/decorators/permissions.decorator';
import { PermissionEnum } from 'src/libs/enums/permission.enum';
import { UploadResponseDto } from './dto/upload-response.dto';

@ApiTags(AppSwaggerTag.Upload || 'Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('file')
  @ApiOperation({ summary: 'Tải file trực tiếp lên hệ thống' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.UPLOAD_FILE)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOkResponse({ description: 'URL của file sau khi tải lên', type: UploadResponseDto })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const url = await this.uploadService.uploadFile(file);
    return { url };
  }

  @Post('url')
  @ApiOperation({ summary: 'Tải file từ URL về hệ thống' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.UPLOAD_FILE)
  @ApiOkResponse({ description: 'URL của file sau khi tải lên', type: UploadResponseDto })
  async uploadFromUrl(@Body() dto: UploadUrlDto) {
    const url = await this.uploadService.uploadFromUrl(dto.url);
    return { url };
  }
}
