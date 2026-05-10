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
  UploadedFiles,
  UseInterceptors,
  Put,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  UpdateProductVariantsDto,
  UpdateProductSeoDto,
} from './dto/update-product-sections.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductOrderDto } from './dto/update-product-order.dto';
import {
  ProductListResponseDto,
  ProductSingleResponseDto,
} from './dto/product-list-response.dto';
import { AppSwaggerTag } from '../swagger/swagger.constant';
import { Public } from 'src/decorators/public.decorator';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { MultipartBody } from 'src/common/decorators/multipartbody.decorator';
import { Permissions } from 'src/decorators/permissions.decorator';
import { PermissionEnum } from 'src/libs/enums/permission.enum';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { CacheService } from '../cache/cache.service';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';

@ApiTags(AppSwaggerTag.Product)
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly cacheService: CacheService,
  ) {}

  @ApiOperation({ summary: 'Lấy danh sách sản phẩm' })
  @ApiOkResponse({
    description: 'Danh sách sản phẩm thành công',
    type: ProductListResponseDto,
  })
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000)
  @Get()
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @ApiOperation({ summary: 'Lấy chi tiết sản phẩm' })
  @ApiOkResponse({
    description: 'Chi tiết sản phẩm',
    type: ProductSingleResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy sản phẩm' })
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  /**
   * @deprecated Use findOne instead, which supports both ID and slug
   */
  @ApiOperation({ summary: 'Lấy chi tiết sản phẩm theo slug (Deprecated)' })
  @ApiOkResponse({
    description: 'Chi tiết sản phẩm',
    type: ProductSingleResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy sản phẩm' })
  @Public()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @ApiOperation({ summary: 'Thêm mới sản phẩm (General Info)' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.PRODUCT_CREATE)
  @ApiCreatedResponse({
    description: 'Sản phẩm đã được tạo',
    type: ProductSingleResponseDto,
  })
  @Post()
  @ApiBody({ type: CreateProductDto })
  async create(@Body() createProductDto: CreateProductDto) {
    const result = await this.productsService.create(createProductDto);
    await this.cacheService.clearPattern('*products*');
    return result;
  }

  @ApiOperation({ summary: 'Sắp xếp thứ tự hiển thị sản phẩm' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.PRODUCT_UPDATE)
  @ApiOkResponse({
    description: 'Thứ tự hiển thị sản phẩm đã được cập nhật',
    type: SuccessResponseDto,
  })
  @ApiBody({ type: UpdateProductOrderDto })
  @Post('display-order')
  async updateDisplayOrder(@Body() dto: UpdateProductOrderDto) {
    const result = await this.productsService.updateDisplayOrder(dto);
    await this.cacheService.clearPattern('*products*');
    return result;
  }

  @ApiOperation({ summary: 'Cập nhật thông tin chung sản phẩm' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.PRODUCT_UPDATE)
  @ApiOkResponse({
    description: 'Sản phẩm đã được cập nhật',
    type: ProductSingleResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy sản phẩm' })
  @Put(':id')
  @ApiBody({ type: UpdateProductDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const result = await this.productsService.updateGeneralInfo(
      id,
      updateProductDto,
    );
    await this.cacheService.clearPattern('*products*');
    return result;
  }

  @ApiOperation({ summary: 'Cập nhật hình ảnh sản phẩm' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.PRODUCT_UPDATE)
  @ApiOkResponse({
    description: 'Hình ảnh sản phẩm đã được cập nhật',
    type: ProductSingleResponseDto,
  })
  @ApiConsumes('multipart/form-data')
  @Post(':id/images')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  async updateImages(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const result = await this.productsService.updateImages(id, files);
    await this.cacheService.clearPattern('*products*');
    return result;
  }

  @ApiOperation({ summary: 'Thêm video cho sản phẩm' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.PRODUCT_UPDATE)
  @ApiOkResponse({
    description: 'Video sản phẩm đã được thêm',
    type: ProductSingleResponseDto,
  })
  @ApiConsumes('multipart/form-data')
  @Post(':id/videos')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        chunkIndex: { type: 'number', description: 'Chỉ số của chunk hiện tại (bắt đầu từ 0)' },
        totalChunks: { type: 'number', description: 'Tổng số chunk' },
        uploadId: { type: 'string', description: 'ID duy nhất cho phiên upload (ví dụ: uuid)' },
        originalname: { type: 'string', description: 'Tên file gốc' },
        isVisible: { type: 'number', description: 'Trạng thái hiển thị (1 = Hiển thị, 0 = Ẩn)' },
      },
    },
  })
  async addVideo(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('chunkIndex') chunkIndexStr?: string,
    @Body('totalChunks') totalChunksStr?: string,
    @Body('uploadId') uploadId?: string,
    @Body('originalname') originalname?: string,
    @Body('isVisible') isVisibleStr?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file video');
    }

    const chunkIndex = chunkIndexStr ? parseInt(chunkIndexStr, 10) : undefined;
    const totalChunks = totalChunksStr ? parseInt(totalChunksStr, 10) : undefined;
    const isVisible = isVisibleStr !== undefined ? parseInt(isVisibleStr, 10) : 1;

    // Chunked upload
    if (chunkIndex !== undefined && totalChunks !== undefined && uploadId) {
      const result = await this.productsService.addVideoChunk(
        id, 
        file, 
        chunkIndex, 
        totalChunks, 
        uploadId, 
        originalname || file.originalname,
        isVisible
      );
      
      if ('id' in result) {
        await this.cacheService.clearPattern('*products*');
      }
      return result;
    }

    // Normal upload
    const result = await this.productsService.addVideo(id, file, isVisible);
    await this.cacheService.clearPattern('*products*');
    return result;
  }

  @ApiOperation({ summary: 'Sắp xếp hình ảnh sản phẩm' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.PRODUCT_UPDATE)
  @ApiOkResponse({
    description: 'Hình ảnh sản phẩm đã được sắp xếp',
    type: ProductSingleResponseDto,
  })
  @Put(':id/images/order')
  @ApiBody({ 
      schema: {
          type: 'object',
          properties: {
              image_ids: { type: 'array', items: { type: 'number' } },
          },
      },
  })
  async reorderImages(
    @Param('id', ParseIntPipe) id: number,
    @Body('image_ids') imageIds: number[],
  ) {
    const result = await this.productsService.reorderImages(id, imageIds || []);
    await this.cacheService.clearPattern('*products*');
    return result;
  }

  @ApiOperation({ summary: 'Xóa hình ảnh sản phẩm' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.PRODUCT_UPDATE)
  @ApiOkResponse({ description: 'Hình ảnh đã được xóa' })
  @Delete(':id/images/:imageId')
  async deleteImage(
    @Param('id', ParseIntPipe) id: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ) {
    const result = await this.productsService.deleteImage(id, imageId);
    await this.cacheService.clearPattern('*products*');
    return result;
  }

  @ApiOperation({ summary: 'Xóa video sản phẩm' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.PRODUCT_UPDATE)
  @ApiOkResponse({ description: 'Video đã được xóa', type: ProductSingleResponseDto })
  @Delete(':id/videos/:videoId')
  async deleteVideo(
    @Param('id', ParseIntPipe) id: number,
    @Param('videoId', ParseIntPipe) videoId: number,
  ) {
    const result = await this.productsService.deleteVideo(id, videoId);
    await this.cacheService.clearPattern('*products*');
    return result;
  }

  @ApiOperation({ summary: 'Cập nhật trạng thái hiển thị video' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.PRODUCT_UPDATE)
  @ApiOkResponse({ description: 'Trạng thái hiển thị video đã được cập nhật', type: ProductSingleResponseDto })
  @Patch(':id/videos/:videoId/visibility')
  async updateVideoVisibility(
    @Param('id', ParseIntPipe) id: number,
    @Param('videoId', ParseIntPipe) videoId: number,
    @Body('isVisible', ParseIntPipe) isVisible: number,
  ) {
    const result = await this.productsService.updateVideoVisibility(id, videoId, isVisible);
    await this.cacheService.clearPattern('*products*');
    return result;
  }

  @ApiOperation({ summary: 'Cập nhật biến thể sản phẩm' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.PRODUCT_UPDATE)
  @ApiOkResponse({
    description: 'Biến thể sản phẩm đã được cập nhật',
    type: ProductSingleResponseDto,
  })
  @Put(':id/variants')
  @ApiBody({ type: UpdateProductVariantsDto })
  async updateVariants(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductVariantsDto,
  ) {
    const result = await this.productsService.updateVariants(
      id,
      dto.variants || [],
    );
    await this.cacheService.clearPattern('*products*');
    return result;
  }

  @ApiOperation({ summary: 'Cập nhật SEO sản phẩm' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.PRODUCT_UPDATE)
  @ApiOkResponse({
    description: 'SEO sản phẩm đã được cập nhật',
    type: ProductSingleResponseDto,
  })
  @ApiConsumes('multipart/form-data')
  @Put(':id/seo')
  @UseInterceptors(FileInterceptor('og_image_file'))
  async updateSeo(
    @Param('id', ParseIntPipe) id: number,
    @MultipartBody(UpdateProductSeoDto) dto: UpdateProductSeoDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const result = await this.productsService.updateSeo(id, dto.seo || {}, file);
    await this.cacheService.clearPattern('*products*');
    return result;
  }


  @ApiOperation({ summary: 'Xóa sản phẩm' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.PRODUCT_DELETE)
  @ApiOkResponse({ description: 'Sản phẩm đã được xóa', type: SuccessResponseDto })
  @ApiNotFoundResponse({ description: 'Không tìm thấy sản phẩm' })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.productsService.remove(id);
    await this.cacheService.clearPattern('*products*');
    return result;
  }
}
