import { BaseResponse } from "./common";
import {
  CategoryResponse,
  CreateCategoryDto as GenCreateCategoryDto,
  UpdateCategoryDto as GenUpdateCategoryDto,
  CategorySimpleResponse,
  CategoryTreeItem as GenCategoryTreeItem,
} from "@/generated/api";

// Export generated types aliases
export type { CategorySimpleResponse };
export type CreateCategoryDto = GenCreateCategoryDto;
export type UpdateCategoryDto = GenUpdateCategoryDto;

// Extend generated types to match runtime data (backend spec is partial)
// and backward compatibility with existing component usage (camelCase)
export type Category = CategoryResponse & {
  image?: string;
  parentId?: number;
  parent_id?: number; // generated style
  isActive?: boolean; // camelCase for backward compat (if runtime provides it)
  is_active?: boolean; // snake_case for generated style
  children?: Category[];
  sortOrder?: number;
  sort_order?: number;
  metaTitle?: string;
  meta_title?: string;
  metaDescription?: string;
  metaKeywords?: string;
};

export type CategoryTreeItem = GenCategoryTreeItem & {
  children?: CategoryTreeItem[];
  image?: string;
  description?: string;
  isActive?: boolean;
};

export type CategoryListResponse = BaseResponse<Category[]>;
export type CategorySingleResponse = BaseResponse<Category>;
