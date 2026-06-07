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
