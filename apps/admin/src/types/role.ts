import { BaseResponse } from "./common";
import {
  RoleResponse,
  PermissionResponse,
  RoleCreateDto as GenCreateRoleDto,
  UpdateRoleDto as GenUpdateRoleDto,
  PermissionAllRolesResponses, // Might be list wrapper
} from "@projects/shared";

// Alias generated types
export type Permission = PermissionResponse;

export type Role = RoleResponse & {
  // Generated might use camelCase e.g. parentId, rolePermissions
  // Manual used parentId, rolePermissions.
  // Generated might have 'permissions: Permission[]'.
  // We extend if missing runtime props, but usually 'RoleResponse' in openapi-ts is accurate.
  // Just in case:
  children?: Role[];
  key?: string;
  rolePermissions?: Permission[];
  permissions?: Permission[];
};

export type CreateRoleDto = GenCreateRoleDto;
export type UpdateRoleDto = GenUpdateRoleDto;

// Query Params
export interface RoleQueryDto {
  page?: number;
  per_page?: number;
  search?: string;
}

// Response
// Generated PermissionAllRolesResponses likely returns { data: RoleResponse[], meta: ... }
// We can use that type directly or map it.
// Start with 'any' or specific if we know it.
export type RoleListResponse = {
  data: Role[];
  meta?: any;
};
export type RoleSingleResponse = BaseResponse<Role>;
