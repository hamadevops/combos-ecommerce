/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  pagesFindAll,
  pagesCreate,
  pagesUpdate,
  pagesRemove,
  pagesFindOne,
} from "@vibe/shared";
import { request } from "@/lib/api-helper";
import { PageResponse } from "@vibe/shared";

export const usePage = (idOrSlug: string | number) => {
  return useQuery({
    queryKey: ["pages", idOrSlug],
    queryFn: () =>
      request<PageResponse>(
        pagesFindOne({
          path: { id: String(idOrSlug) },
        }) as any,
      ),
    enabled: !!idOrSlug,
  });
};

export const usePages = () => {
  return useQuery({
    queryKey: ["pages"],
    queryFn: () =>
      request<PageResponse[]>(
        pagesFindAll() as any,
      ),
  });
};

export const useCreatePage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      request<PageResponse>(
        pagesCreate({
          body: data,
        }) as any,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });
};

export const useUpdatePage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      request<PageResponse>(
        pagesUpdate({
          path: { id },
          body: data,
        }) as any,
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["pages", data.id] });
      }
      if (data?.slug) {
        queryClient.invalidateQueries({ queryKey: ["pages", data.slug] });
      }
    },
  });
};

export const useDeletePage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      request(
        pagesRemove({
          path: { id },
        }) as any,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });
};
