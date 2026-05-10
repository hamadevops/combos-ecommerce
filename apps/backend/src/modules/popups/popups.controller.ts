import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { PopupsService } from './popups.service';
import { CreatePopupDto } from './dto/create-popup.dto';
import { UpdatePopupDto } from './dto/update-popup.dto';
import { PopupQueryDto } from './dto/popup-query.dto';
import { Public } from '../../decorators/public.decorator';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CacheService } from '../cache/cache.service';

import { Permissions } from '../../decorators/permissions.decorator';
import { PermissionEnum } from '../../libs/enums/permission.enum';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';
import { PopupResponseDto, PopupListResponseDto } from './responses/popup.response';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Popups')
@Controller('popups')
export class PopupsController {
  constructor(
    private readonly popupsService: PopupsService,
    private readonly cacheService: CacheService,
  ) { }

  @ApiOperation({ summary: 'Get all popups' })
  @ApiOkResponse({ description: 'List of popups', type: PopupListResponseDto })
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000) // 5 minutes
  @Get()
  findAll(@Query() query: PopupQueryDto) {
    return this.popupsService.findAll(query);
  }

  @ApiOperation({ summary: 'Get active popup for client' })
  @ApiOkResponse({ description: 'Active popup details', type: PopupResponseDto })
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000) // 5 minutes
  @Get('active')
  findActive() {
    return this.popupsService.findActive();
  }

  @ApiOperation({ summary: 'Get popup by ID' })
  @ApiOkResponse({ description: 'Popup details', type: PopupResponseDto })
  @ApiNotFoundResponse({ description: 'Popup not found' })
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000) // 5 minutes
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.popupsService.findOne(id);
  }

  @ApiOperation({ summary: 'Create a new popup' })
  @ApiCreatedResponse({ description: 'Popup created successfully', type: PopupResponseDto })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @Permissions(PermissionEnum.POPUP_CREATE)
  @UseInterceptors(FileInterceptor('image'))
  @Post()
  async create(
    @Body() createPopupDto: CreatePopupDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const result = await this.popupsService.create(createPopupDto, file);
    await this.cacheService.clearPattern('*popups*');
    return result;
  }

  @ApiOperation({ summary: 'Update a popup' })
  @ApiOkResponse({ description: 'Popup updated successfully', type: PopupResponseDto })
  @ApiNotFoundResponse({ description: 'Popup not found' })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @Permissions(PermissionEnum.POPUP_UPDATE)
  @UseInterceptors(FileInterceptor('image'))
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePopupDto: UpdatePopupDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const result = await this.popupsService.update(id, updatePopupDto, file);
    await this.cacheService.clearPattern('*popups*');
    return result;
  }

  @ApiOperation({ summary: 'Delete a popup' })
  @ApiOkResponse({ description: 'Popup deleted successfully', type: SuccessResponseDto })
  @ApiNotFoundResponse({ description: 'Popup not found' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.POPUP_DELETE)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.popupsService.remove(id);
    await this.cacheService.clearPattern('*popups*');
    return result;
  }
}
