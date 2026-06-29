import {
  permissionAllRoles,
  permissionRoleDetail,
  permissionCreate,
  permissionUpdateRole,
  permissionDeleteRole,
  permissionGetAllPermissions,
  permissionCreatePermission,
  permissionUpdatePermission,
  permissionDeletePermission,
  permissionGetGroupedPermissions,
  permissionGetAllPermissionGroups,
  permissionCreatePermissionGroup,
  permissionUpdatePermissionGroup,
  permissionDeletePermissionGroup,
  permissionAssignPermissionsToGroup,
  permissionRemovePermissionsFromGroup,
} from "@projects/shared";
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

  // Create Permission
  createPermission: (data: any) => {
    return request<Permission>(
      permissionCreatePermission({
        body: data,
      }) as any,
    );
  },

  // Update Permission
  updatePermission: (id: number, data: any) => {
    return request<Permission>(
      permissionUpdatePermission({
        path: { id },
        body: data,
      }) as any,
    );
  },

  // Delete Permission
  deletePermission: (id: number) => {
    return request<void>(
      permissionDeletePermission({
        path: { id },
      }) as any,
    );
  },

  // Get Grouped Permissions
  getGroupedPermissions: () => {
    return request<any>(permissionGetGroupedPermissions() as any);
  },

  // Get Permission Groups
  getPermissionGroups: () => {
    return request<any>(permissionGetAllPermissionGroups() as any);
  },

  // Create Permission Group
  createPermissionGroup: (data: any) => {
    return request<any>(
      permissionCreatePermissionGroup({
        body: data,
      }) as any,
    );
  },

  // Update Permission Group
  updatePermissionGroup: (id: number, data: any) => {
    return request<any>(
      permissionUpdatePermissionGroup({
        path: { id },
        body: data,
      }) as any,
    );
  },

  // Delete Permission Group
  deletePermissionGroup: (id: number) => {
    return request<void>(
      permissionDeletePermissionGroup({
        path: { id },
      }) as any,
    );
  },

  // Assign Permissions to Group
  assignPermissionsToGroup: (groupId: number, permissionIds: number[]) => {
    return request<any>(
      permissionAssignPermissionsToGroup({
        path: { id: groupId },
        body: { permission_ids: permissionIds },
      }) as any,
    );
  },

  // Remove Permissions from Group
  removePermissionsFromGroup: (groupId: number, permissionIds: number[]) => {
    return request<any>(
      permissionRemovePermissionsFromGroup({
        path: { id: groupId },
        body: { permission_ids: permissionIds },
      }) as any,
    );
  },
};
