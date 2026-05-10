import { useQuery } from "@tanstack/react-query";
import { customersFindAll } from "@vibe/shared";
import { request } from "@/lib/api-helper";
import { CustomersFindAllResponse } from "@vibe/shared";

export const useCustomers = (params?: { page?: number; limit?: number; search?: string }) => {
  return useQuery({
    queryKey: ["customers", params],
    queryFn: () =>
      request<CustomersFindAllResponse>(
        customersFindAll({
          query: params as any,
        }) as any,
      ),
  });
};
