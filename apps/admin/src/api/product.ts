import {
  productsFindAll,
  productsFindOne,
  productsFindBySlug,
  productsCreate,
  productsUpdate,
  productsUpdateImages,
  productsDeleteImage,
  productsReorderImages,
  productsUpdateVariants,
  productsUpdateSeo,
  productsRemove,
  productsAddVideo,
  productsDeleteVideo,
  productsUpdateVideoVisibility,
  productsUpdateDisplayOrder,
  tierVariationsSetTierVariations,
} from "@projects/shared";
import type { ProductSortEnum, ProductQueryTypeEnum } from "@projects/shared";
import { BaseResponse } from "@/types/common";
import {
  CreateProductDto,
  ProductListResponse,
  ProductSingleResponse,
  UpdateProductDto,
  SetTierVariationsDto,
} from "@/types/product";

// Helper to unwrap standard response or throw error
const request = async <T>(promise: Promise<{ data?: T; error?: unknown }>): Promise<T> => {
  const { data, error } = await promise;
  if (error) {
    throw error;
  }
  return data as T;
};

export const productApi = {
  // Get all products
  getList: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryIds?: number[];
    minPrice?: number;
    maxPrice?: number;
    isFeatured?: boolean | 0 | 1;
    isRecommended?: boolean | 0 | 1;
    sort?: ProductSortEnum;
    type?: ProductQueryTypeEnum;
    similar_to?: string;
    isActive?: 0 | 1;
    minStock?: number;
    maxStock?: number;
    sku?: string;
  }) => {
    return request<ProductListResponse>(
      productsFindAll({
        query: {
          page: params?.page,
          limit: params?.limit,
          search: params?.search,
          min_price: params?.minPrice,
          max_price: params?.maxPrice,
          isFeatured: params?.isFeatured !== undefined ? (params.isFeatured ? 1 : 0) : undefined,
          isRecommended: params?.isRecommended !== undefined ? (params.isRecommended ? 1 : 0) : undefined,
          sort: params?.sort,
          category_ids: params?.categoryIds,
          type: params?.type,
          similar_to: params?.similar_to,
          isActive: params?.isActive,
          minStock: params?.minStock,
          maxStock: params?.maxStock,
          sku: params?.sku,
        },
      }) as any,
    );
  },

  // Get one product by ID
  getOne: (identifier: string | number) => {
    return request<ProductSingleResponse>(
      productsFindOne({
        path: {
          id: String(identifier),
        },
      }) as any,
    );
  },

  getBySlug: (slug: string) => {
    return request<ProductSingleResponse>(
      // @ts-ignore
      productsFindBySlug({
        path: {
          slug,
        },
      }),
    );
  },

  // Create a new product (General Info only)
  create: (data: CreateProductDto) => {
    return request<ProductSingleResponse>(
      productsCreate({
        body: {
          name: data.name,
          slug: data.slug,
          sku: data.sku,
          price: data.price,
          stock: data.stock,
          short_description: data.short_description,
          description: data.description,
          sale_price: data.sale_price,
          cost_price: data.cost_price,
          is_featured: data.is_featured,
          is_recommended: (data as any).is_recommended,
          category_ids: data.category_ids,
          files: null, // Required by DTO but unused in JSON create
        },
      }) as any,
    );
  },

  // Update product general info
  updateGeneralInfo: (id: number, data: UpdateProductDto) => {
    // openapi-ts expects body directly
    return request<ProductSingleResponse>(
      productsUpdate({
        path: { id },
        body: data,
      }) as any,
    );
  },

  // Update product images
  updateImages: (id: number, files: File[]) => {
    // The generated client handles FormData serialization if the structure matches
    // But we use a custom structure for the body.
    // We pass the object, and the client deserializes it to FormData?
    // Actually, we should check if productsUpdateImages uses formDataBodySerializer.
    // If so, we pass a plain object.
    return request<ProductSingleResponse>(
      productsUpdateImages({
        path: { id },
        body: {
          files: files,
        } as any,
      }) as any,
    );
  },

  // Delete product image
  deleteImage: (productId: number, imageId: number) => {
    return request<BaseResponse<void>>(
      productsDeleteImage({
        path: {
          id: productId,
          imageId: imageId,
        },
      }) as any,
    );
  },

  // Add video chunk for product
  addVideo: (
    id: number,
    data: {
      file: File;
      chunkIndex: number;
      totalChunks: number;
      uploadId: string;
      originalname: string;
      isVisible?: number;
    },
  ) => {
    return request<ProductSingleResponse>(
      productsAddVideo({
        path: { id },
        body: data as any,
      }) as any,
    );
  },

  // Delete product video
  deleteVideo: (productId: number, videoId: number) => {
    return request<BaseResponse<void>>(
      productsDeleteVideo({
        path: {
          id: productId,
          videoId: videoId,
        },
      }) as any,
    );
  },

  // Toggle video visibility
  updateVideoVisibility: (productId: number, videoId: number, isVisible: number) => {
    return request<BaseResponse<void>>(
      productsUpdateVideoVisibility({
        path: {
          id: productId,
          videoId: videoId,
        },
        body: {
          isVisible,
        }
      } as any) as any,
    );
  },

  // Reorder product images
  reorderImages: (id: number, imageIds: number[]) => {
    return request<ProductSingleResponse>(
      productsReorderImages({
        path: { id },
        body: {
          image_ids: imageIds,
        },
      }) as any,
    );
  },

  // Update product variants
  updateVariants: (id: number, variants: any[]) => {
    return request<ProductSingleResponse>(
      productsUpdateVariants({
        path: { id },
        body: {
          variants,
        },
      }) as any,
    );
  },

  // Set Tier Variations
  setTierVariations: (id: number, data: SetTierVariationsDto) => {
    return request<ProductSingleResponse>(
      tierVariationsSetTierVariations({
        path: { id: String(id) },
        body: data,
      } as any) as any,
    );
  },

  // Update product SEO
  updateSeo: (id: number, seo: any) => {
    const body: any = {
      seo: {
        seo_title: seo.title,
        seo_description: seo.description,
        seo_keywords: seo.keywords,
        canonical_url: seo.canonicalUrl,
        og_image: typeof seo.ogImage === "string" ? seo.ogImage : undefined,
      },
    };

    if (seo.ogImage instanceof File) {
      body.og_image_file = seo.ogImage;
    }

    return request<ProductSingleResponse>(
      productsUpdateSeo({
        path: { id },
        body: body,
      } as any) as any,
    );
  },

  // Deprecated/Legacy Update
  update: (id: number, data: UpdateProductDto) => {
    return productApi.updateGeneralInfo(id, data);
  },

  // Delete a product
  delete: (id: number) => {
    return request<BaseResponse<void>>(
      productsRemove({
        path: { id },
      }) as any,
    );
  },

  // Update product display order (batch)
  updateDisplayOrder: (products: { id: number; display_order: number }[]) => {
    return request<BaseResponse<void>>(
      productsUpdateDisplayOrder({
        body: { products },
      }) as any,
    );
  },
};
