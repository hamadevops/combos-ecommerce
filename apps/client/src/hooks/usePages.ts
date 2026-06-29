import { useQuery } from "@tanstack/react-query";
import { pageApi } from "@/api/page";

export const usePages = () => {
  return useQuery({
    queryKey: ["pages"],
    queryFn: async () => {
      const response = await pageApi.getList();
      return response.data;
    },
  });
};

export const usePage = (idOrSlug: string | number) => {
  return useQuery({
    queryKey: ["page", idOrSlug],
    queryFn: async () => {
      const response = await pageApi.getOne(idOrSlug);
      return response.data;
    },
    enabled: !!idOrSlug,
  });
};
