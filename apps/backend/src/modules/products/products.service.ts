import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Product } from 'src/database/entities/product.entity';
import { EntityManager, EntityRepository, FilterQuery } from '@mikro-orm/mysql';
import slugify from 'slugify';
import { CustomBadRequestException } from 'src/common/exceptions/custom-exceptions';
import { ActiveProductEnum } from './enum/active.enum';
import { generateProductSku } from 'src/common/utils/sku.util';
import { ProductVariant } from 'src/database/entities/product-variant.entity';

import { ProductQueryDto, ProductSortEnum, ProductQueryTypeEnum } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductImage } from 'src/database/entities/product-image.entity';
import { UploadService } from '../upload/upload.service';
import { Category } from 'src/database/entities/category.entity';
import { ProductVideo } from 'src/database/entities/product-video.entity';
import { ProductSeoDto } from './dto/product-seo.dto';
import { CreateProductVariantDto } from './dto/product-variant.dto';
import { UpdateProductOrderDto } from './dto/update-product-order.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: EntityRepository<Product>,
    private readonly em: EntityManager,
    private readonly uploadService: UploadService,
  ) { }

  async findAll(query: ProductQueryDto) {
    const { page = 1, limit = 10, search, isActive, type, similar_to } = query;
    const offset = (page - 1) * limit;

    const isSitemap = type === ProductQueryTypeEnum.SITEMAP;

    // ── Build WHERE conditions ──────────────────────────────────────
    const where: FilterQuery<Product> = { deletedAt: null };

    if (search) {
      where.name = { $like: `%${search}%` };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (type === ProductQueryTypeEnum.RECOMMENDED) {
      where.isRecommended = 1;
      where.isActive = ActiveProductEnum.Active;
    }

    if (type === ProductQueryTypeEnum.MAY_LIKE) {
      where.isActive = ActiveProductEnum.Active;
    }

    if (type === ProductQueryTypeEnum.SITEMAP) {
      where.isActive = ActiveProductEnum.Active;
    }

    // Handle "Similar"
    let hasCategoryFilter = false;
    if (type === ProductQueryTypeEnum.SIMILAR && similar_to) {
      let referenceProduct;
      if (!isNaN(Number(similar_to))) {
        referenceProduct = await this.productRepository.findOne(Number(similar_to), { populate: ['categories'] });
      } else {
        referenceProduct = await this.productRepository.findOne({ slug: similar_to } as any, { populate: ['categories'] });
      }

      if (referenceProduct) {
        const categoryIds = referenceProduct.categories.getItems().map(c => c.id);
        if (categoryIds.length > 0) {
          where.categories = { id: { $in: categoryIds } };
          where.id = { $ne: referenceProduct.id };
          hasCategoryFilter = true;
        } else {
          where.id = -1;
        }
        where.isActive = ActiveProductEnum.Active;
      } else {
        where.id = -1;
      }
    }

    // Explicit category filters
    let explicitCategoryIds: number[] = [];
    if (query.category_ids) explicitCategoryIds = explicitCategoryIds.concat(query.category_ids);
    if (query.categoryIds) explicitCategoryIds = explicitCategoryIds.concat(query.categoryIds);

    const validIds = [...new Set(explicitCategoryIds.filter(id => !!id))];
    if (validIds.length > 0) {
      if (hasCategoryFilter && (where.categories as any)?.id?.$in) {
        const existingIds = (where.categories as any).id.$in;
        const intersectedIds = validIds.filter(id => existingIds.includes(id));
        where.categories = { id: { $in: intersectedIds.length > 0 ? intersectedIds : [-1] } };
      } else {
        where.categories = { id: { $in: validIds } };
      }
      hasCategoryFilter = true;
    }

    if (query.min_price !== undefined || query.max_price !== undefined) {
      where.price = {};
      if (query.min_price !== undefined) where.price.$gte = query.min_price;
      if (query.max_price !== undefined) where.price.$lte = query.max_price;
    }

    if (query.isFeatured !== undefined && type !== ProductQueryTypeEnum.RECOMMENDED) {
      where.isFeatured = query.isFeatured;
    }

    if (query.isRecommended !== undefined && type !== ProductQueryTypeEnum.RECOMMENDED) {
      where.isRecommended = query.isRecommended;
    }

    if (query.sku) {
      where.sku = { $like: `%${query.sku}%` };
    }

    if (query.minStock !== undefined || query.maxStock !== undefined) {
      where.stock = {};
      if (query.minStock !== undefined) (where.stock as any).$gte = query.minStock;
      if (query.maxStock !== undefined) (where.stock as any).$lte = query.maxStock;
    }

    if (query.minSoldCount !== undefined) {
      where.soldCount = { $gte: query.minSoldCount } as any;
    }

    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) (where.createdAt as any).$gte = new Date(query.dateFrom);
      if (query.dateTo) {
        const end = new Date(query.dateTo);
        end.setHours(23, 59, 59, 999);
        (where.createdAt as any).$lte = end;
      }
    }

    // ── Build ORDER BY ──────────────────────────────────────────────
    let orderBy: any = { createdAt: 'DESC' };
    if (query.sort) {
      switch (query.sort) {
        case ProductSortEnum.NEWEST:
          orderBy = { createdAt: 'DESC' };
          break;
        case ProductSortEnum.BEST_SELLING:
          orderBy = { soldCount: 'DESC' };
          break;
        case ProductSortEnum.PRICE_ASC:
          orderBy = { price: 'ASC' };
          break;
        case ProductSortEnum.PRICE_DESC:
          orderBy = { price: 'DESC' };
          break;
        case ProductSortEnum.NAME_ASC:
          orderBy = { name: 'ASC' };
          break;
        case ProductSortEnum.NAME_DESC:
          orderBy = { name: 'DESC' };
          break;
        case ProductSortEnum.DISPLAY_ORDER_ASC:
          orderBy = { displayOrder: 'ASC' };
          break;
        case ProductSortEnum.DISPLAY_ORDER_DESC:
          orderBy = { displayOrder: 'DESC' };
          break;
      }
    }

    // ── SITEMAP: lấy toàn bộ, không cần 2-step ─────────────────────
    if (isSitemap) {
      const [items, total] = await this.productRepository.findAndCount(where, {
        populate: ['images'],
        fields: ['id', 'name', 'slug', 'updatedAt', 'images.id', 'images.url', 'images.altText', 'images.position'],
        orderBy,
      });

      return {
        items,
        meta: { total, page: 1, limit: total, totalPages: 1 },
      };
    }

    // ── STEP 1: Lấy DISTINCT product IDs + count bằng QueryBuilder ──
    // Tách ra 2 bước để tránh lỗi LIMIT bị sai khi JOIN ManyToMany (categories)
    const qb = this.em.createQueryBuilder(Product, 'p');
    qb.select('p.id');

    // Áp dụng category filter bằng JOIN
    if (hasCategoryFilter && where.categories) {
      const catIds = (where.categories as any).id.$in;
      qb.join('p.categories', 'c').andWhere({ 'c.id': { $in: catIds } });
      delete where.categories;
    }

    // hasVariants filter: dùng subquery thay vì $exists (không hỗ trợ trên QB MySQL)
    if (query.hasVariants === true) {
      qb.andWhere('p.id IN (SELECT DISTINCT pv.product_id FROM product_variant pv)');
      delete where.variants;
    } else if (query.hasVariants === false) {
      qb.andWhere('p.id NOT IN (SELECT DISTINCT pv.product_id FROM product_variant pv)');
      delete where.variants;
    }

    // Apply remaining where conditions
    if (Object.keys(where).length > 0) {
      qb.andWhere(where);
    }

    qb.groupBy('p.id');

    // Đếm total: clone QB → wrap trong COUNT(*) để tránh lỗi COUNT + GROUP BY
    const countQb = qb.clone();
    const knex = this.em.getKnex();
    const countResult = await knex.raw(
      `SELECT COUNT(*) as total FROM (${countQb.getFormattedQuery()}) as sub`,
    );
    // mysql2 trả về [[rows], fields] hoặc [rows]
    const total = Number(countResult[0]?.[0]?.total ?? countResult[0]?.total ?? 0);

    // Áp dụng pagination + ordering lên QB gốc (chưa bị finalize)
    qb.orderBy(orderBy)
      .limit(Number(limit))
      .offset(Number(offset));

    const idRows = await qb.execute<{ id: number }[]>();
    const productIds = idRows.map(row => row.id);

    if (productIds.length === 0) {
      return {
        items: [],
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
    }

    // ── STEP 2: Load full entities theo IDs đã phân trang ──
    const items = await this.productRepository.find(
      { id: { $in: productIds } },
      {
        populate: ['variants', 'images', 'categories', 'tierVariations.options'],
        populateWhere: { variants: { deletedAt: null } } as any,
        orderBy,
        exclude: ['description'],
      },
    );

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(idOrSlug: number | string) {
    let product;
    if (typeof idOrSlug === 'number' || /^\d+$/.test(String(idOrSlug))) {
      product = await this.productRepository.findOne({ id: Number(idOrSlug), deletedAt: null }, {
        populate: [
          'variants.tierIndexes.tierOption',
          'images',
          'categories',
          'tierVariations.options',
          'videos',
        ],
        populateWhere: {
          variants: { deletedAt: null },
          videos: { isVisible: 1 },
        } as any,
        orderBy: { images: { position: 'ASC' } } as any,
      });
    } else {
      product = await this.productRepository.findOne({ slug: String(idOrSlug), deletedAt: null } as any, {
        populate: [
          'variants.tierIndexes.tierOption',
          'images',
          'categories',
          'tierVariations.options',
          'videos',
        ],
        populateWhere: {
          variants: { deletedAt: null },
          videos: { isVisible: 1 },
        } as any,
        orderBy: { images: { position: 'ASC' } } as any,
      });
    }

    if (!product) {
      throw new NotFoundException(`Product with ID/slug '${idOrSlug}' not found`);
    }

    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.productRepository.findOne({ slug, deletedAt: null } as any, {
      populate: [
        'variants.tierIndexes.tierOption',
        'images',
        'categories',
        'tierVariations.options',
        'videos',
      ],
      populateWhere: {
        variants: { deletedAt: null },
        videos: { isVisible: 1 },
      } as any,
      orderBy: { images: { position: 'ASC' } } as any,
    });

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    return product;
  }

  async create(dto: CreateProductDto) {
    return await this.em.transactional(async (em) => {
      const slug = dto.slug
        ? slugify(dto.slug, { lower: true, strict: true })
        : slugify(dto.name, { lower: true, strict: true });

      const existed = await em.findOne(Product, { slug });
      if (existed) {
        throw new CustomBadRequestException('Sản phẩm với tên này đã tồn tại');
      }

      const product = em.create(Product, {
        name: dto.name,
        slug,
        sku: generateProductSku(dto.name),
        price: dto.price,
        salePrice: dto.sale_price,
        costPrice: dto.cost_price,
        stock: dto.stock || 0,
        soldCount: 0,
        isFeatured: (dto.isFeatured ?? dto.is_featured) ? 1 : 0,
        isRecommended: (dto.isRecommended ?? dto.is_recommended) ? 1 : 0,
        productType: dto.product_type ?? 'purchase',
        affiliateLink: dto.affiliate_link,
        isActive: ActiveProductEnum.Inactive,
        displayOrder: 0,
        shortDescription: dto.short_description,
        description: dto.description,
        createdAt: new Date(),
        updatedAt: new Date(),
        specifications: dto.specifications,
      });

      // Handle categories
      if (dto.category_ids && dto.category_ids.length > 0) {
        const categories = await em.find(Category, {
          id: { $in: dto.category_ids },
        });
        for (const category of categories) {
          product.categories.add(category);
        }
      }

      await em.persistAndFlush(product);
      return product;
    });
  }

  async updateGeneralInfo(id: number, dto: UpdateProductDto) {
    return await this.em.transactional(async (em) => {
      console.log(`Updating General Info for product ${id}`, dto);
      const product = await em.findOne(Product, id);
      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      if (dto.slug && dto.slug !== product.slug) {
        product.slug = slugify(dto.slug, { lower: true, strict: true });
      } else if (dto.name && dto.name !== product.name && !dto.slug) {
        // Only auto-regenerate slug from name if name changed AND no new slug provided
        // But if user didn't touch slug input (it's optional in DTO), we might want to keep existing slug or regenerate?
        // Standard CMS behavior: if name changes, slug usually changes unless locked.
        // Here we assume if slug is NOT in DTO, we regenerate IF name changed.
        product.slug = slugify(dto.name, { lower: true, strict: true });
      }

      if (dto.name) product.name = dto.name;

      if (dto.short_description !== undefined)
        product.shortDescription = dto.short_description;
      if (dto.description !== undefined) product.description = dto.description;
      if (dto.sku !== undefined) product.sku = dto.sku;

      // Update pricing and inventory
      if (dto.price !== undefined) product.price = dto.price;
      if (dto.sale_price !== undefined) product.salePrice = dto.sale_price;
      if (dto.cost_price !== undefined) product.costPrice = dto.cost_price;
      if (dto.stock !== undefined) product.stock = dto.stock;

      const isActive = dto.isActive ?? dto.active;
      if (isActive !== undefined) product.isActive = isActive;

      const isFeatured = dto.isFeatured ?? dto.is_featured;
      if (isFeatured !== undefined)
        product.isFeatured = isFeatured ? 1 : 0;

      const isRecommended = dto.isRecommended ?? dto.is_recommended;
      if (isRecommended !== undefined)
        product.isRecommended = isRecommended ? 1 : 0;

      if (dto.specifications !== undefined) product.specifications = dto.specifications;

      if (dto.display_order !== undefined) product.displayOrder = dto.display_order;

      const productType = dto.product_type;
      if (productType !== undefined) product.productType = productType;

      const affiliateLink = dto.affiliate_link;
      if (affiliateLink !== undefined) product.affiliateLink = affiliateLink;

      // Handle categories update
      if (dto.category_ids !== undefined) {
        product.categories.removeAll();
        if (dto.category_ids.length > 0) {
          const categories = await em.find(Category, {
            id: { $in: dto.category_ids },
          });
          for (const category of categories) {
            product.categories.add(category);
          }
        }
      }

      product.updatedAt = new Date();
      await em.flush();
      return product;
    });
  }

  async updateImages(id: number, files: Express.Multer.File[]) {
    return await this.em.transactional(async (em) => {
      const product = await em.findOne(Product, id, { populate: ['images'] });
      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      // Append new images. If replacing is desired, we should have a clear flag or different endpoint.
      // Based on typical "Add Image" flow, we append. But if "Update Images" implies replacing:
      // Current logic in original code REPLACED ALL. Let's stick to user request "tách ra việc tạo sản phẩm... thêm hình ảnh"
      // Usually separate tab means "Manage Images" -> Add/Remove.
      // For simplicity and matching typical "upload" behavior, let's Append if POST/PUT to images endpoint, unless we handle deletion separately.
      // However, original Update logic replaced ALL. Let's make this endpoint APPEND for now, and rely on Delete Image (if exists) for removal, OR
      // if this is a "Save Tab" that sends current state, it might expect replacement.
      // Given the form submits a list of files, it's safer to REPLACE ALL to match the "Form Submission" mental model, OR
      // we can just ADD. Original was REPLACE. Let's simple ADD for now as it's safer, but user might want to replace.
      // Actually, if we use the same UI "ImageUpload" which manages the list, the user expects the resulting state to match what they see.
      // BUT, we only send FILES here. We don't send "retained existing images".
      // So this method effectively "Adds new images".
      // Existing images are handled by NOT deleting them here. Deletion should be a separate action or we need a more complex "Sync" logic.
      // For MVP refactor: This endpoint ADDS images.

      const currentMaxPosition = product.images.getItems().reduce((max, img) => Math.max(max, img.position), 0);

      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const imageUrl = await this.uploadService.uploadFile(
            files[i],
            'products',
          );
          em.create(ProductImage, {
            product,
            url: imageUrl,
            altText: `${product.name} ${currentMaxPosition + i + 1}`,
            position: currentMaxPosition + i + 1,
            createdAt: new Date(),
          });

          if (!product.ogImage && product.images.length === 0 && i === 0) {
            // If no OG image and this is the first image ever
            product.ogImage = imageUrl;
          }
        }
      }

      await em.flush();
      return product; // Return updated product
    });
  }

  async addVideo(id: number, file: Express.Multer.File, isVisible: number = 1) {
    return await this.em.transactional(async (em) => {
      const product = await em.findOne(Product, id, { populate: ['videos'] });
      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      // Upload video file
      const videoUrl = await this.uploadService.uploadFile(file, 'products/videos');
      
      const currentMaxPosition = product.videos.getItems().reduce((max, vid) => Math.max(max, vid.displayOrder), 0);
      
      const productVideo = em.create(ProductVideo, {
        product,
        videoUrl,
        displayOrder: currentMaxPosition + 1,
        isVisible,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      product.videos.add(productVideo);

      await em.flush();
      return product;
    });
  }

  async addVideoChunk(
    id: number,
    file: Express.Multer.File,
    chunkIndex: number,
    totalChunks: number,
    uploadId: string,
    originalname: string,
    isVisible: number = 1,
  ) {
    // 1. Verify product exists
    const productExists = await this.productRepository.count({ id });
    if (!productExists) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // 2. Upload the chunk via generic logic
    await this.uploadService.uploadChunk(uploadId, chunkIndex, file);

    // 3. Complete and attach if it's the last chunk
    if (chunkIndex === totalChunks - 1) {
      const videoUrl = await this.uploadService.completeChunkUpload(
        uploadId,
        totalChunks,
        originalname,
        'products/videos'
      );

      return await this.em.transactional(async (em) => {
        const currentProduct = await em.findOne(Product, id, { populate: ['videos'] });
        
        if (!currentProduct) {
          throw new NotFoundException(`Product with ID ${id} not found during finalize`);
        }

        const currentMaxPosition = currentProduct.videos.getItems().reduce((max, vid) => Math.max(max, vid.displayOrder), 0);
        
        const productVideo = em.create(ProductVideo, {
          product: currentProduct,
          videoUrl,
          displayOrder: currentMaxPosition + 1,
          isVisible,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        currentProduct.videos.add(productVideo);

        await em.flush();
        return currentProduct;
      });
    }

    return { message: `Chunk ${chunkIndex + 1}/${totalChunks} uploaded` };
  }

  async deleteImage(productId: number, imageId: number) {
    return await this.em.transactional(async (em) => {
      console.log(`Deleting image ${imageId} for product ${productId}`);
      const product = await em.findOne(Product, productId, { populate: ['images'] });
      if (!product) throw new NotFoundException('Product not found');

      const image = product.images.getItems().find((i) => i.id === imageId);
      if (!image) {
        console.warn(`Image ${imageId} not found in product ${productId}`);
        throw new NotFoundException('Image not found');
      }

      console.log(`Removing image ${imageId} from collection`);
      product.images.remove(image);
      // Explicitly remove entity to ensure deletion if orphanRemoval fails conceptually (though it shouldn't)
      em.remove(image);

      // Also delete file from storage if needed
      // await this.uploadService.deleteFile(image.url); 

      await em.flush();
      console.log(`Image ${imageId} deleted.`);
      return product;
    });
  }

  async deleteVideo(productId: number, videoId: number) {
    return await this.em.transactional(async (em) => {
      console.log(`Deleting video ${videoId} for product ${productId}`);
      const product = await em.findOne(Product, productId, { populate: ['videos'] });
      if (!product) throw new NotFoundException('Product not found');

      const video = product.videos.getItems().find((v) => v.id === videoId);
      if (!video) {
        console.warn(`Video ${videoId} not found in product ${productId}`);
        throw new NotFoundException('Video not found');
      }

      console.log(`Removing video ${videoId} from collection`);
      product.videos.remove(video);
      em.remove(video);

      // Xóa file trên MinIO
      if (video.videoUrl) {
          await this.uploadService.deleteFile(video.videoUrl);
      }
      
      // Nếu có dùng thumbnail trên minio thì xóa luôn
      if (video.thumbnailUrl && video.thumbnailUrl.startsWith('/')) {
          await this.uploadService.deleteFile(video.thumbnailUrl);
      }

      await em.flush();
      console.log(`Video ${videoId} deleted.`);
      return product;
    });
  }

  async updateVideoVisibility(productId: number, videoId: number, isVisible: number) {
    return await this.em.transactional(async (em) => {
      const product = await em.findOne(Product, productId, { populate: ['videos'] });
      if (!product) throw new NotFoundException('Product not found');

      const video = product.videos.getItems().find((v) => v.id === videoId);
      if (!video) throw new NotFoundException('Video not found');

      video.isVisible = isVisible;
      await em.flush();
      
      return product;
    });
  }

  async reorderImages(id: number, imageIds: number[]) {
    return await this.em.transactional(async (em) => {
      console.log(`Reordering images for product ${id}. New Order IDs:`, imageIds);
      const product = await em.findOne(Product, id, { populate: ['images'] });
      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      const images = product.images.getItems();
      console.log('Current images before sort:', images.map(i => ({ id: i.id, pos: i.position })));

      // Update position based on the index in imageIds
      imageIds.forEach((imageId, index) => {
        const image = images.find(img => img.id === imageId);
        if (image) {
          image.position = index;
          console.log(`Setting Image ${imageId} to position ${index}`);
        } else {
          console.warn(`Image ${imageId} not found in product images`);
        }
      });

      product.updatedAt = new Date();
      await em.flush();
      // Re-fetch or log to confirm?
      console.log('Images after flush:', product.images.getItems().map(i => ({ id: i.id, pos: i.position })));
      return product;
    });
  }

  async updateVariants(id: number, variantsDto: CreateProductVariantDto[]) {
    return await this.em.transactional(async (em) => {
      const product = await em.findOne(Product, id, { populate: ['variants.tierIndexes.tierOption'] });
      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      const existingVariants = product.variants.getItems();

      if (variantsDto && variantsDto.length > 0) {
        for (const variantDto of variantsDto) {
          // Find if there's an existing variant matching id, name, or optionValues
          let variant = existingVariants.find((v) => {
            if (variantDto.id && v.id === variantDto.id) return true;
            if (variantDto.name && v.name === variantDto.name) return true;
            if (variantDto.optionValues && v.optionValues) {
              const opts = variantDto.optionValues;
              if (v.optionValues.length === opts.length && 
                  v.optionValues.every((val, i) => val === opts[i])) {
                return true;
              }
            }
            return false;
          });

          if (variant) {
            // Update fields in place
            variant.sku = variantDto.sku ?? variant.sku;
            variant.price = variantDto.price;
            variant.salePrice = variantDto.sale_price ?? undefined;
            variant.costPrice = variantDto.cost_price ?? undefined;
            variant.stock = variantDto.stock ?? 0;
            if (variantDto.isActive !== undefined) {
              variant.isActive = variantDto.isActive;
            }
            variant.deletedAt = undefined; // restore if was soft-deleted
            variant.updatedAt = new Date();
          } else {
            // Create a new variant
            const newVar = em.create(ProductVariant, {
              product,
              sku: variantDto.sku ?? null,
              price: variantDto.price,
              salePrice: variantDto.sale_price ?? undefined,
              costPrice: variantDto.cost_price ?? undefined,
              stock: variantDto.stock ?? 0,
              isActive: 1,
              name: variantDto.name,
              optionValues: variantDto.optionValues,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            em.persist(newVar);
            product.variants.add(newVar);
          }
        }
      }

      // Hard delete variants that are missing from DTO
      const incomingIds = variantsDto.map(d => d.id).filter(Boolean);
      const incomingNames = variantsDto.map(d => d.name).filter(Boolean);

      for (const variant of existingVariants) {
        const isMatched = incomingIds.includes(variant.id) || 
                          (variant.name && incomingNames.includes(variant.name));
        if (!isMatched) {
          product.variants.remove(variant);
          em.remove(variant);
        }
      }

      product.updatedAt = new Date();
      await em.flush();
      return product;
    });
  }

  async updateSeo(id: number, seoDto: ProductSeoDto, file?: Express.Multer.File) {
    return await this.em.transactional(async (em) => {
      console.log(`Updating SEO for product ${id}`, seoDto, file ? 'File received' : 'No file');
      const product = await em.findOne(Product, id);
      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      if (seoDto.seo_title !== undefined) product.seoTitle = seoDto.seo_title;
      if (seoDto.seo_description !== undefined) product.seoDescription = seoDto.seo_description;
      if (seoDto.seo_keywords !== undefined) product.seoKeywords = seoDto.seo_keywords;
      if (seoDto.canonical_url !== undefined) product.canonicalUrl = seoDto.canonical_url;

      // Handle OG Image file upload
      if (file) {
        console.log('Uploading new SEO image via File');
        const imageUrl = await this.uploadService.uploadFile(file, 'products/seo');
        product.ogImage = imageUrl;
      } else if (seoDto.og_image !== undefined) {
        console.log('Setting SEO image via String URL:', seoDto.og_image);
        // If string URL explicitly passed (e.g. cleared or set to existing url via string)
        product.ogImage = seoDto.og_image;
      }

      product.updatedAt = new Date();
      await em.flush();
      console.log('SEO updated result:', product.ogImage);
      return product;
    });
  }

  async update(
    id: number,
    dto: UpdateProductDto,
    files?: Express.Multer.File[],
  ) {
    // Deprecated monolithic update - keeping for backward compatibility if needed, 
    // or we can redirect to specific methods. 
    // Given the refactor, we should probably remove it or make it just call updateGeneralInfo.
    // Let's replace it with updateGeneralInfo logic + warning, or just keep it as "General Update"

    return this.updateGeneralInfo(id, dto);
  }

  async remove(id: number) {
    const product = await this.productRepository.findOne({ id, deletedAt: null }, {
      populate: ['images', 'videos', 'tierVariations.options'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Since this is a soft delete, we do NOT physically remove files from MinIO
    // to preserve historical order logs and prevent broken image/video links.
    product.deletedAt = new Date();
    await this.em.flush();
    return { success: true };
  }

  async updateDisplayOrder(dto: UpdateProductOrderDto) {
    return await this.em.transactional(async (em) => {
      for (const item of dto.products) {
        const product = await em.findOne(Product, item.id);
        if (!product) {
          throw new NotFoundException(`Product with ID ${item.id} not found`);
        }
        product.displayOrder = item.display_order;
      }
      await em.flush();
      return { success: true, updated: dto.products.length };
    });
  }
}
