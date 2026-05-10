import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roleApi } from "@/api/role";
import { CreateRoleDto, UpdateRoleDto, RoleQueryDto } from "@/types/role";
import { toast } from "sonner";

export const useRoles = (params?: RoleQueryDto) => {
  return useQuery({
    queryKey: ["roles", params],
    queryFn: () => roleApi.getAll(params),
  });
};

export const useRole = (id: number) => {
  return useQuery({
    queryKey: ["roles", id],
    queryFn: () => roleApi.getOne(id),
    enabled: !!id && id > 0,
  });
};

export const usePermissions = () => {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: () => roleApi.getPermissions(),
    staleTime: 1000 * 60 * 10, // Cache permissions for 10 minutes
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoleDto) => roleApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Đã thêm vai trò mới");
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể tạo vai trò");
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRoleDto }) => roleApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Đã cập nhật vai trò");
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể cập nhật vai trò");
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => roleApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Đã xóa vai trò");
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể xóa vai trò");
    },
  });
};

export const useCreatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => roleApi.createPermission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      toast.success("Đã thêm quyền hệ thống mới");
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể tạo quyền hạn");
    },
  });
};

export const useUpdatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => roleApi.updatePermission(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      toast.success("Đã cập nhật quyền hạn");
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể cập nhật quyền hạn");
    },
  });
};

export const usePermission = (id: number) => {
  const { data: permissions = [] } = usePermissions();
  const rawList = Array.isArray(permissions) ? permissions : (permissions as any)?.data || [];
  const permission = rawList.find((p: any) => p.id === id);
  return { data: permission };
};

export const useDeletePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => roleApi.deletePermission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      toast.success("Đã xóa quyền hạn");
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể xóa quyền hạn");
    },
  });
};

export const usePermissionGroups = () => {
  return useQuery({
    queryKey: ["permission-groups"],
    queryFn: () => roleApi.getPermissionGroups(),
  });
};

export const useGroupedPermissions = () => {
  return useQuery({
    queryKey: ["grouped-permissions"],
    queryFn: () => roleApi.getGroupedPermissions(),
  });
};

export const useCreatePermissionGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => roleApi.createPermissionGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permission-groups"] });
      toast.success("Đã thêm nhóm quyền mới");
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể tạo nhóm quyền");
    },
  });
};

export const useUpdatePermissionGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => roleApi.updatePermissionGroup(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permission-groups"] });
      toast.success("Đã cập nhật nhóm quyền");
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể cập nhật nhóm quyền");
    },
  });
};

export const useDeletePermissionGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => roleApi.deletePermissionGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permission-groups"] });
      queryClient.invalidateQueries({ queryKey: ["grouped-permissions"] });
      toast.success("Đã xóa nhóm quyền");
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể xóa nhóm quyền");
    },
  });
};

export const useAssignPermissionsToGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, permissionIds }: { groupId: number; permissionIds: number[] }) =>
      roleApi.assignPermissionsToGroup(groupId, permissionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permission-groups"] });
      queryClient.invalidateQueries({ queryKey: ["grouped-permissions"] });
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      toast.success("Đã gán quyền vào nhóm");
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể gán quyền vào nhóm");
    },
  });
};

export const useRemovePermissionsFromGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, permissionIds }: { groupId: number; permissionIds: number[] }) =>
      roleApi.removePermissionsFromGroup(groupId, permissionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permission-groups"] });
      queryClient.invalidateQueries({ queryKey: ["grouped-permissions"] });
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      toast.success("Đã gỡ quyền khỏi nhóm");
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể gỡ quyền khỏi nhóm");
    },
  });
};
