import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contactsFindAll, contactsUpdateStatus, contactsRemove, contactsCreate, contactsUpdate } from "@projects/shared";
import { request } from "@/lib/api-helper";
import { ContactsFindAllResponses, ContactsUpdateStatusResponses } from "@projects/shared";

export const useContacts = (params?: { page?: number; limit?: number; search?: string; type?: string; status?: string }) => {
  return useQuery({
    queryKey: ["contacts", params],
    queryFn: () =>
      request<any>(
        contactsFindAll({
          query: params as any,
        }) as any,
      ),
  });
};

export const useUpdateContactStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      request<ContactsUpdateStatusResponses>(
        contactsUpdateStatus({
          path: { id },
          body: { status } as any,
        }) as any,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
};

export const useCreateContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      request(
        contactsCreate({
          body: data,
        }) as any,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
};

export const useUpdateContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      request(
        contactsUpdate({
          path: { id },
          body: data,
        }) as any,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
};

export const useDeleteContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      request(
        contactsRemove({
          path: { id },
        }) as any,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
};
