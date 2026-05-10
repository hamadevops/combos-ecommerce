import {
  permissionAllRoles,
  permissionRoleDetail,
  permissionCreate,
  permissionUpdateRole,
  permissionDeleteRole,
  permissionGetAllPermissions,
} from "@vibe/shared";
import { request } from "@/lib/api-helper";
import {
  Role,
  CreateRoleDto,
  UpdateRoleDto,
  RoleQueryDto,
  Permission,
  RoleListResponse,
} from "@/types/role";
import { BaseResponse } from "@/types/common";

export const roleApi = {
  // Get all roles
  getAll: (params?: RoleQueryDto) => {
    // Generated: permissionAllRoles({ query: { ... } })
    return request<RoleListResponse>( // or RoleListResponse
      permissionAllRoles({
        query: {
          search: params?.search,
          // page/limit might be supported if backend supports pagination for roles
          // generated spec will tell.
          // For now map what we can.
        } as any,
      }) as any,
    );
  },

  // Get one role
  getOne: (id: number) => {
    return request<Role>(
      permissionRoleDetail({
        path: { id },
      }) as any,
    );
  },

  // Create role
  create: (data: CreateRoleDto) => {
    return request<Role>(
      permissionCreate({
        body: data,
      }) as any,
    );
  },

  // Update role
  update: (id: number, data: UpdateRoleDto) => {
    return request<Role>(
      permissionUpdateRole({
        path: { id },
        body: data,
      }) as any,
    );
  },

  // Delete role
  delete: (id: number) => {
    return request<void>(
      permissionDeleteRole({
        path: { id },
      }) as any,
    );
  },

  // Get All Permissions
  getPermissions: () => {
    return request<Permission[]>(permissionGetAllPermissions() as any);
  },
};
