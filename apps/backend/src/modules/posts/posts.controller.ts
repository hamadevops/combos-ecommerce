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
  UseInterceptors,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostQueryDto } from './dto/post-query.dto';
import { SchedulePostDto } from './dto/schedule-post.dto';
import {
  PostListResponseDto,
  PostSingleResponseDto,
} from './responses/post-list.response';
import { AppSwaggerTag } from '../swagger/swagger.constant';
import { Public } from 'src/decorators/public.decorator';
import { Permissions } from 'src/decorators/permissions.decorator';
import { PermissionEnum } from 'src/libs/enums/permission.enum';
import { MultipartBody } from 'src/common/decorators/multipartbody.decorator';

import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { CacheService } from '../cache/cache.service';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';
import { ThumbnailResponseDto } from './dto/thumbnail-response.dto';

@ApiTags(AppSwaggerTag.Post || 'Posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly cacheService: CacheService,
  ) {}

  @ApiOperation({
    summary: 'Get all posts with comprehensive filters',
    description:
      'Supports search, multi-topic/tag, slug, author, status, date ranges (published & created), view count range, thumbnail check, and flexible sorting.',
  })
  @ApiOkResponse({ description: 'List of posts', type: PostListResponseDto })
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000)
  @Get()
  findAll(@Query() query: PostQueryDto) {
    return this.postsService.findAll(query);
  }

  @ApiOperation({ summary: 'Get post by ID' })
  @ApiOkResponse({ description: 'Post details', type: PostSingleResponseDto })
  @ApiNotFoundResponse({ description: 'Post not found' })
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000)
  @Get(':idOrSlug')
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.postsService.findOne(idOrSlug);
  }

  @ApiOperation({ summary: 'Create a new post' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.POST_CREATE)
  @ApiCreatedResponse({
    description: 'Post created successfully',
    type: PostSingleResponseDto,
  })
  @ApiConsumes('multipart/form-data')
  @Post()
  @ApiBody({ type: CreatePostDto })
  @UseInterceptors(FileInterceptor('thumbnail'))
  async create(
    @MultipartBody(CreatePostDto) createPostDto: CreatePostDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Request() req: any,
  ) {
    const result = await this.postsService.create(
      createPostDto,
      file,
      req.user.id,
    );
    await this.cacheService.clearPattern('posts');
    return result;
  }

  @ApiOperation({ summary: 'Update a post' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.POST_UPDATE)
  @ApiOkResponse({
    description: 'Post updated successfully',
    type: PostSingleResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Post not found' })
  @ApiConsumes('multipart/form-data')
  @Patch(':id')
  @ApiBody({ type: UpdatePostDto })
  @UseInterceptors(FileInterceptor('thumbnail'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @MultipartBody(UpdatePostDto) updatePostDto: UpdatePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const result = await this.postsService.update(id, updatePostDto, file);
    await this.cacheService.clearPattern('posts');
    return result;
  }

  @ApiOperation({ summary: 'Delete a post' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.POST_DELETE)
  @ApiOkResponse({ description: 'Post deleted successfully', type: SuccessResponseDto })
  @ApiNotFoundResponse({ description: 'Post not found' })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.postsService.remove(id);
    await this.cacheService.clearPattern('posts');
    return result;
  }

  @ApiOperation({ summary: 'Publish a post immediately' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.POST_PUBLISH)
  @ApiOkResponse({ description: 'Post published successfully', type: PostSingleResponseDto })
  @Post(':id/publish')
  async publish(@Param('id', ParseIntPipe) id: number) {
    const result = await this.postsService.publish(id);
    await this.cacheService.clearPattern('posts');
    return result;
  }

  @ApiOperation({ summary: 'Schedule a post for future publication' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.POST_PUBLISH)
  @ApiOkResponse({ description: 'Post scheduled successfully', type: PostSingleResponseDto })
  @Post(':id/schedule')
  async schedule(
    @Param('id', ParseIntPipe) id: number,
    @Body() schedulePostDto: SchedulePostDto,
  ) {
    const result = await this.postsService.schedule(id, schedulePostDto);
    await this.cacheService.clearPattern('posts');
    return result;
  }

  @ApiOperation({ summary: 'Upload post thumbnail' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.POST_UPDATE)
  @ApiOkResponse({ description: 'Thumbnail uploaded successfully', type: ThumbnailResponseDto })
  @ApiConsumes('multipart/form-data')
  @Post(':id/thumbnail')
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
  @UseInterceptors(FileInterceptor('file'))
  async uploadThumbnail(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.postsService.uploadThumbnail(id, file);
    await this.cacheService.clearPattern('posts');
    return result;
  }

  @ApiOperation({ summary: 'Remove post thumbnail' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.POST_UPDATE)
  @ApiOkResponse({ description: 'Thumbnail removed successfully', type: SuccessResponseDto })
  @Delete(':id/thumbnail')
  async removeThumbnail(@Param('id', ParseIntPipe) id: number) {
    const result = await this.postsService.removeThumbnail(id);
    await this.cacheService.clearPattern('posts');
    return result;
  }
}
