import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PageResponse } from './responses/page.response';
import { Public } from 'src/decorators/public.decorator';
import { Permissions } from 'src/decorators/permissions.decorator';
import { PermissionEnum } from 'src/libs/enums/permission.enum';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';

@ApiTags('Pages')
@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  /**
   * @deprecated Use findOne instead, which supports both ID and slug
   */
  @ApiOperation({ summary: 'Get page by slug (Public) - Deprecated' })
  @ApiOkResponse({ description: 'The page details', type: PageResponse })
  @ApiNotFoundResponse({ description: 'Page not found' })
  @Public()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.pagesService.findBySlug(slug);
  }

  @ApiOperation({ summary: 'Create Page' })
  @ApiCreatedResponse({
    description: 'The Page has been created.',
    type: PageResponse,
  })
  @ApiConflictResponse({ description: 'Slug already exists' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.PAGE_CREATE)
  @Post()
  create(@Body() createPageDto: CreatePageDto) {
    return this.pagesService.create(createPageDto);
  }

  @ApiOperation({ summary: 'Get all Pages (Public)' })
  @ApiOkResponse({ description: 'List of all Pages', type: [PageResponse] })
  @Public()
  @Get()
  findAll() {
    return this.pagesService.findAll(true); 
  }

  @ApiOperation({ summary: 'Get Page by ID or Slug' })
  @ApiOkResponse({ description: 'The Page found', type: PageResponse })
  @ApiNotFoundResponse({ description: 'Page not found' })
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pagesService.findOne(id);
  }

  @ApiOperation({ summary: 'Update Page' })
  @ApiOkResponse({
    description: 'The Page has been updated.',
    type: PageResponse,
  })
  @ApiNotFoundResponse({ description: 'Page not found' })
  @ApiConflictResponse({ description: 'Slug already exists' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.PAGE_UPDATE)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePageDto: UpdatePageDto,
  ) {
    return this.pagesService.update(id, updatePageDto);
  }

  @ApiOperation({ summary: 'Delete Page' })
  @ApiOkResponse({ description: 'The Page has been deleted.', type: SuccessResponseDto })
  @ApiNotFoundResponse({ description: 'Page not found' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.PAGE_DELETE)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pagesService.remove(id);
  }
}
