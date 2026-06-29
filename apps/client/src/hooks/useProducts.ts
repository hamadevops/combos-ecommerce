import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { productApi } from "@/api/product";
import { CreateProductDto, UpdateProductDto } from "@/types/product";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { Product } from "@/types/product";

interface UseProductsParams {
  page?: number;
  limit?: number;
  categoryIds?: number[];
  search?: string;
  sort?: string; // 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc'
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  type?: string;
  similar_to?: string;
  enabled?: boolean;
}

// Fetch list of products
export const useProducts = (params: UseProductsParams = {}) => {
  const actualSort = params.sort || "display_order_asc";
  const { enabled = true, ...queryParams } = { ...params, sort: actualSort };
  return useQuery({
    queryKey: ["products", queryParams],
    queryFn: async () => {
      const response = await productApi.getList({
        page: queryParams.page,
        limit: queryParams.limit,
        search: queryParams.search,
        minPrice: queryParams.minPrice,
        maxPrice: queryParams.maxPrice,
        isFeatured: queryParams.isFeatured,
        sort: queryParams.sort,
        categoryIds: queryParams.categoryIds,
        type: queryParams.type,
        similar_to: queryParams.similar_to,
      });

      // The productApi.getList returns ProductListResponse which has { data: ProductResponse[], meta: ... }
      // We return { items: response.data, meta: response.meta } to maintain compatibility if UI expects 'items'
      // Or we can return response directly if UI adapts.
      // Looking at existing code:
      // "return { items: data, meta: {} };"

      return response;
    },
    enabled,
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
  const actualSort = params.sort || "display_order_asc";
  const { enabled = true, ...queryParams } = { ...params, sort: actualSort };
  const limit = queryParams.limit || 12;

  return useInfiniteQuery({
    queryKey: ["products-infinite", queryParams],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await productApi.getList({
        ...queryParams,
        page: pageParam,
        limit,
      });

      return response;
    },
    initialPageParam: 1,
    enabled,
    getNextPageParam: (lastPage: any) => {
      const nextP = (lastPage.meta?.page || 1) + 1;
      return lastPage.meta && lastPage.meta.total > lastPage.meta.page * (lastPage.meta.limit || 12)
        ? nextP
        : undefined;
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

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
