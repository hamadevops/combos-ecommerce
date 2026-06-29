import {
  categoriesFindAll,
  categoriesFindTree,
  categoriesFindOne,
  categoriesCreate,
  categoriesUpdate,
  categoriesRemove,
} from "@projects/shared";
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
  getList: (params?: { page?: number; limit?: number; search?: string }) => {
    return request<CategoryListResponse>(
      categoriesFindAll({
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
  getBySlug: async (slug: string) => {
    // API does not encourage fetching by slug directly in path. We search and filter.
    const listResponse = await request<CategoryListResponse>(
      categoriesFindAll({
        query: { search: slug },
      } as any) as any,
    );
    // listResponse matches CategoryListResponseDto: { data: Category[], ... }
    const item = listResponse.data?.find((c: any) => c.slug === slug);

    if (!item) {
      // Return null or throw? Failing usually throws.
      throw { status: 404, message: "Category not found" };
    }

    // Wrap as SingleResponse
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
