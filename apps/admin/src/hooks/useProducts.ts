import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { productApi } from "@/api/product";
import { CreateProductDto, UpdateProductDto } from "@/types/product";
import type { ProductSortEnum, ProductQueryTypeEnum } from "@projects/shared";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { Product } from "@/types/product";

interface UseProductsParams {
  page?: number;
  limit?: number;
  categoryIds?: number[];
  search?: string;
  sort?: ProductSortEnum;
  isFeatured?: boolean | 0 | 1;
  isRecommended?: boolean | 0 | 1;
  isActive?: 0 | 1;
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  maxStock?: number;
  sku?: string;
  type?: ProductQueryTypeEnum;
  similar_to?: string;
  enabled?: boolean;
}

// Fetch list of products
export const useProducts = (params: UseProductsParams = {}) => {
  const { enabled, ...restParams } = params;
  return useQuery({
    queryKey: ["products", restParams],
    queryFn: async () => {
      // Use standard generated API
      // Note: mapping params to API expected format if needed
      // productApi.getList expects specific param names if defined in openapi-ts
      // But we passed 'any' in productApi.getList implementation to raw query object in some cases?
      // No, productApi.getList maps them explicitly.

      const response = await productApi.getList({
        page: restParams.page,
        limit: restParams.limit,
        search: restParams.search,
        minPrice: restParams.minPrice,
        maxPrice: restParams.maxPrice,
        minStock: restParams.minStock,
        maxStock: restParams.maxStock,
        isActive: restParams.isActive,
        sku: restParams.sku,
        isFeatured: restParams.isFeatured === true ? 1 : restParams.isFeatured === false ? 0 : restParams.isFeatured,
        isRecommended: restParams.isRecommended === true ? 1 : restParams.isRecommended === false ? 0 : restParams.isRecommended,
        sort: restParams.sort,
        categoryIds: restParams.categoryIds,
        type: restParams.type,
        similar_to: restParams.similar_to,
      });

      // The productApi.getList returns ProductListResponse which has { data: ProductResponse[], meta: ... }
      // We return { items: response.data, meta: response.meta } to maintain compatibility if UI expects 'items'
      // Or we can return response directly if UI adapts.
      // Looking at existing code:
      // "return { items: data, meta: {} };"

      return {
        items: response.data as Product[],
        meta: response.meta,
      };
    },
    enabled: enabled !== undefined ? enabled : true,
  });
};

// Fetch single product details
export const useProduct = (idOrSlug: number | string) => {
  return useQuery({
    queryKey: ["product", idOrSlug],
    queryFn: async () => {
      let response;
      if (
        typeof idOrSlug === "number" ||
        (typeof idOrSlug === "string" && /^\d+$/.test(idOrSlug))
      ) {
        response = await productApi.getOne(idOrSlug);
      } else {
        response = await productApi.getBySlug(String(idOrSlug));
      }
      // productApi returns ProductSingleResponse { data: ProductResponse }
      return response.data as Product;
    },
    enabled: !!idOrSlug,
  });
};

// Fetch Featured Products (Convenience hook)
export const useFeaturedProducts = () => {
  return useProducts({ isFeatured: true, limit: 10 });
};

// Fetch New Arrivals (Convenience hook)
export const useNewArrivals = () => {
  return useProducts({ sort: "newest", limit: 10 });
};

// Infinite scroll products hook
export const useInfiniteProducts = (params: Omit<UseProductsParams, "page"> = {}) => {
  const limit = params.limit || 12;

  return useInfiniteQuery({
    queryKey: ["products-infinite", params],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await productApi.getList({
        ...params,
        page: pageParam,
        limit,
      });

      return {
        items: response.data as Product[],
        meta: response.meta,
        nextPage:
          response.meta && response.meta.total > pageParam * limit ? pageParam + 1 : undefined,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: CreateProductDto) => productApi.create(data),
    onSuccess: (data) => {
      toast.success("Đã tạo sản phẩm thành công. Vui lòng thêm hình ảnh va biến thể.");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      // Navigate handled by component to go to next step/edit mode
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi tạo sản phẩm");
    },
  });
};

export const useUpdateProduct = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProductDto) => productApi.updateGeneralInfo(id, data),
    onSuccess: () => {
      toast.success("Đã cập nhật thông tin chung thành công");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi cập nhật sản phẩm");
    },
  });
};

export const useUpdateProductImages = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (files: File[]) => productApi.updateImages(id, files),
    onSuccess: () => {
      toast.success("Đã cập nhật hình ảnh thành công");
      queryClient.invalidateQueries({ queryKey: ["product", id] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi cập nhật hình ảnh");
    },
  });
};

export const useDeleteProductImage = (productId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: number) => productApi.deleteImage(productId, imageId),
    onSuccess: () => {
      toast.success("Đã xóa hình ảnh thành công");
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi xóa hình ảnh");
    },
  });
};

export const useUpdateProductVariants = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variants: any[]) => productApi.updateVariants(id, variants),
    onSuccess: () => {
      toast.success("Đã cập nhật biến thể thành công");
      queryClient.invalidateQueries({ queryKey: ["product", id] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi cập nhật biến thể");
    },
  });
};

export const useSetTierVariations = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => productApi.setTierVariations(id, data),
    onSuccess: () => {
      toast.success("Đã tạo các phiên bản sản phẩm thành công");
      queryClient.invalidateQueries({ queryKey: ["product", id] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Tạo phiên bản thất bại");
    },
  });
};

export const useUpdateProductSeo = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (seo: any) => productApi.updateSeo(id, seo),
    onSuccess: () => {
      toast.success("Đã cập nhật SEO thành công");
      queryClient.invalidateQueries({ queryKey: ["product", id] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi cập nhật SEO");
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productApi.delete(id),
    onSuccess: () => {
      toast.success("Đã xóa sản phẩm thành công");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi xóa sản phẩm");
    },
  });
};

export const useUpdateProductOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (products: { id: number; display_order: number }[]) =>
      productApi.updateDisplayOrder(products),
    onSuccess: () => {
      toast.success("Đã lưu thứ tự sản phẩm thành công");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi lưu thứ tự");
    },
  });
};
