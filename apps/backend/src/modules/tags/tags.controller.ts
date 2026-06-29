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
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagQueryDto } from './dto/tag-query.dto';
import {
  TagListResponseDto,
  TagSingleResponseDto,
} from './responses/tag-list.response';
import { AppSwaggerTag } from '../swagger/swagger.constant';
import { Public } from 'src/decorators/public.decorator';
import { Permissions } from 'src/decorators/permissions.decorator';
import { PermissionEnum } from 'src/libs/enums/permission.enum';

import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { CacheService } from '../cache/cache.service';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';

@ApiTags(AppSwaggerTag.Tag || 'Tags')
@Controller('tags')
export class TagsController {
  constructor(
    private readonly tagsService: TagsService,
    private readonly cacheService: CacheService,
  ) {}

  @ApiOperation({ summary: 'Get all tags' })
  @ApiOkResponse({ description: 'List of tags', type: TagListResponseDto })
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000)
  @Get()
  findAll(@Query() query: TagQueryDto) {
    return this.tagsService.findAll(query);
  }

  @ApiOperation({ summary: 'Get tag by ID' })
  @ApiOkResponse({ description: 'Tag details with posts', type: TagSingleResponseDto })
  @ApiNotFoundResponse({ description: 'Tag not found' })
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tagsService.findOne(id);
  }

  @ApiOperation({ summary: 'Create a new tag' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.TAG_CREATE)
  @ApiCreatedResponse({
    description: 'Tag created successfully',
    type: TagSingleResponseDto,
  })
  @Post()
  async create(@Body() createTagDto: CreateTagDto) {
    const result = await this.tagsService.create(createTagDto);
    await this.cacheService.clearPattern('tags');
    return result;
  }

  @ApiOperation({ summary: 'Update a tag' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.TAG_UPDATE)
  @ApiOkResponse({
    description: 'Tag updated successfully',
    type: TagSingleResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Tag not found' })
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTagDto: UpdateTagDto,
  ) {
    const result = await this.tagsService.update(id, updateTagDto);
    await this.cacheService.clearPattern('tags');
    return result;
  }

  @ApiOperation({ summary: 'Delete a tag' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.TAG_DELETE)
  @ApiOkResponse({ description: 'Tag deleted successfully', type: SuccessResponseDto })
  @ApiNotFoundResponse({ description: 'Tag not found' })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.tagsService.remove(id);
    await this.cacheService.clearPattern('tags');
    return result;
  }
}
