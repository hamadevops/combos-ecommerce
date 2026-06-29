import {
  categoriesFindAll,
  categoriesFindTree,
  categoriesFindOne,
  categoriesCreate,
  categoriesUpdate,
  categoriesRemove,
} from "@/generated/api";
import "@/lib/openapi-config";
import { request } from "@/lib/api-helper";
import {
  CategoryListResponse,
  CategorySingleResponse,
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryTreeItem,
} from "@/types/category";

export const categoryApi = {
  // Get all categories (list)
  // Maps params: page, limit, search -> options
  getList: (
    params?: { page?: number; limit?: number; search?: string },
    options?: { client?: any },
  ) => {
    return request<CategoryListResponse>(
      categoriesFindAll({
        client: options?.client,
        query: params,
      } as any) as any,
    );
  },

  // Get category tree
  getTree: () => {
    // Generated return type might be CategoriesFindTreeResponses which has data: CategoryTreeItem[]
    // Manual 'getTree' returned CategoryListResponse (BaseResponse<Category[]>).
    // Validating compatibility: CategoryTreeItem[] matches Category[]?
    // Tree items have children.
    // We cast just to be safe and let runtime handle structure.
    return request<any>(categoriesFindTree() as any);
  },

  // Get one category by ID
  getOne: (id: number) => {
    return request<CategorySingleResponse>(
      categoriesFindOne({
        path: { id: String(id) },
      }) as any,
    );
  },

  // Get one category by Slug
  getBySlug: async (slug: string, options?: { client?: any }) => {
    // If backend supports /categories/{idOrSlug}, we use it.
    // Given the previous feedback, let's assume we should try direct fetch or optimized search.
    // For now, let's use search with limit 1 and exact match to be more efficient than full list.
    const listResponse = await request<CategoryListResponse>(
      categoriesFindAll({
        client: options?.client,
        query: { search: slug, limit: 1 },
      } as any) as any,
    );

    // Exact match check
    const item = listResponse.data?.find((c: any) => c.slug === slug);

    if (!item) {
      throw { status: 404, message: "Category not found" };
    }

    return { data: item } as CategorySingleResponse;
  },

  // Create a new category
  create: (data: CreateCategoryDto) => {
    return request<CategorySingleResponse>(
      categoriesCreate({
        body: data as any, // data (DTO) has image: File, generated expects Blob|File, should match
      }) as any,
    );
  },

  // Update a category
  update: (id: number, data: UpdateCategoryDto) => {
    return request<CategorySingleResponse>(
      categoriesUpdate({
        path: { id },
        // generated update takes 'body' but DTO might be partial.
        // generated expects { name?: ... }
        // data already matches UpdateCategoryDto structure.
        body: data as any,
      }) as any,
    );
  },

  // Delete a category
  delete: (id: number) => {
    return request<void>(
      categoriesRemove({
        path: { id },
      }) as any,
    );
  },
};
