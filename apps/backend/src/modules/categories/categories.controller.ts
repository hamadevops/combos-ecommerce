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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';
import {
  CategoryListResponseDto,
  CategorySingleResponseDto,
} from './responses/category-list.response';
import { CategoryTreeResponseDto } from './responses/category-tree.response';
import { AppSwaggerTag } from '../swagger/swagger.constant';
import { Public } from 'src/decorators/public.decorator';
import { Permissions } from 'src/decorators/permissions.decorator';
import { PermissionEnum } from 'src/libs/enums/permission.enum';
import { MultipartBody } from 'src/common/decorators/multipartbody.decorator';

import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { CacheService } from '../cache/cache.service';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';

@ApiTags(AppSwaggerTag.Category || 'Categories')
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly cacheService: CacheService,
  ) {}

  @ApiOperation({ summary: 'Get all categories' })
  @ApiOkResponse({
    description: 'List of categories',
    type: CategoryListResponseDto,
  })
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000)
  @Get()
  findAll(@Query() query: CategoryQueryDto) {
    return this.categoriesService.findAll(query);
  }

  @ApiOperation({ summary: 'Get category tree structure' })
  @ApiOkResponse({
    description: 'Hierarchical category tree',
    type: CategoryTreeResponseDto,
  })
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000)
  @Get('tree')
  findTree() {
    return this.categoriesService.findTree();
  }

  @ApiOperation({ summary: 'Get category by ID' })
  @ApiOkResponse({
    description: 'Category details',
    type: CategorySingleResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Category not found' })
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @ApiOperation({ summary: 'Create a new category' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.CATEGORY_CREATE)
  @ApiCreatedResponse({
    description: 'Category created successfully',
    type: CategorySingleResponseDto,
  })
  @ApiConsumes('multipart/form-data')
  @Post()
  @ApiBody({ type: CreateCategoryDto })
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @MultipartBody(CreateCategoryDto) createCategoryDto: CreateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const result = await this.categoriesService.create(createCategoryDto, file);
    await this.cacheService.clearPattern('*categories*');
    return result;
  }

  @ApiOperation({ summary: 'Update a category' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.CATEGORY_UPDATE)
  @ApiOkResponse({
    description: 'Category updated successfully',
    type: CategorySingleResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Category not found' })
  @ApiConsumes('multipart/form-data')
  @Patch(':id')
  @ApiBody({ type: UpdateCategoryDto })
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @MultipartBody(UpdateCategoryDto) updateCategoryDto: UpdateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const result = await this.categoriesService.update(
      id,
      updateCategoryDto,
      file,
    );
    await this.cacheService.clearPattern('*categories*');
    return result;
  }

  @ApiOperation({ summary: 'Delete a category' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.CATEGORY_DELETE)
  @ApiOkResponse({ description: 'Category deleted successfully', type: SuccessResponseDto })
  @ApiNotFoundResponse({ description: 'Category not found' })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.categoriesService.remove(id);
    await this.cacheService.clearPattern('*categories*');
    return result;
  }

  @ApiOperation({ summary: 'Upload category image' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.CATEGORY_UPDATE)
  @ApiOkResponse({ description: 'Image uploaded successfully', type: CategorySingleResponseDto })
  @ApiConsumes('multipart/form-data')
  @Post(':id/image')
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
  async uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.categoriesService.uploadImage(id, file);
    await this.cacheService.clearPattern('*categories*');
    return result;
  }

  @ApiOperation({ summary: 'Remove category image' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.CATEGORY_UPDATE)
  @ApiOkResponse({ description: 'Image removed successfully', type: CategorySingleResponseDto })
  @Delete(':id/image')
  async removeImage(@Param('id', ParseIntPipe) id: number) {
    const result = await this.categoriesService.removeImage(id);
    await this.cacheService.clearPattern('*categories*');
    return result;
  }
}
