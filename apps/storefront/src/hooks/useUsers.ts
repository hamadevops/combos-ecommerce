import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/api/user";

export const useUsers = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: number;
}) => {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => userApi.getList(params),
  });
};
