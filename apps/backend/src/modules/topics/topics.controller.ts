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
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { TopicQueryDto } from './dto/topic-query.dto';
import {
  TopicListResponseDto,
  TopicSingleResponseDto,
} from './responses/topic-list.response';
import { AppSwaggerTag } from '../swagger/swagger.constant';
import { Public } from 'src/decorators/public.decorator';
import { Permissions } from 'src/decorators/permissions.decorator';
import { PermissionEnum } from 'src/libs/enums/permission.enum';

import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { CacheService } from '../cache/cache.service';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';

@ApiTags(AppSwaggerTag.Topic || 'Topics')
@Controller('topics')
export class TopicsController {
  constructor(
    private readonly topicsService: TopicsService,
    private readonly cacheService: CacheService,
  ) {}

  @ApiOperation({ summary: 'Get all topics' })
  @ApiOkResponse({ description: 'List of topics', type: TopicListResponseDto })
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000)
  @Get()
  findAll(@Query() query: TopicQueryDto) {
    return this.topicsService.findAll(query);
  }

  @ApiOperation({ summary: 'Get topic tree structure' })
  @ApiOkResponse({ description: 'Hierarchical topic tree (max 3 levels)' })
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000)
  @Get('tree')
  findTree() {
    return this.topicsService.findTree();
  }

  @ApiOperation({ summary: 'Get topic by ID' })
  @ApiOkResponse({ description: 'Topic details', type: TopicSingleResponseDto })
  @ApiNotFoundResponse({ description: 'Topic not found' })
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.topicsService.findOne(id);
  }

  @ApiOperation({ summary: 'Create a new topic' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.TOPIC_CREATE)
  @ApiCreatedResponse({
    description: 'Topic created successfully',
    type: TopicSingleResponseDto,
  })
  @Post()
  async create(@Body() createTopicDto: CreateTopicDto) {
    const result = await this.topicsService.create(createTopicDto);
    await this.cacheService.clearPattern('topics');
    return result;
  }

  @ApiOperation({ summary: 'Update a topic' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.TOPIC_UPDATE)
  @ApiOkResponse({
    description: 'Topic updated successfully',
    type: TopicSingleResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Topic not found' })
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTopicDto: UpdateTopicDto,
  ) {
    const result = await this.topicsService.update(id, updateTopicDto);
    await this.cacheService.clearPattern('topics');
    return result;
  }

  @ApiOperation({ summary: 'Delete a topic' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.TOPIC_DELETE)
  @ApiOkResponse({ description: 'Topic deleted successfully', type: SuccessResponseDto })
  @ApiNotFoundResponse({ description: 'Topic not found' })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.topicsService.remove(id);
    await this.cacheService.clearPattern('topics');
    return result;
  }
}
