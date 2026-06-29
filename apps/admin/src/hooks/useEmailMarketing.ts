import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  emConfigApi,
  emContactApi,
  emSegmentApi,
  emTemplateApi,
  emCampaignApi,
} from "@/api/email-marketing";
import type {
  CreateEmContactDto,
  UpdateEmContactDto,
  CreateEmSegmentDto,
  UpdateEmSegmentDto,
  CreateEmTemplateDto,
  UpdateEmTemplateDto,
  PreviewEmTemplateDto,
  CreateEmCampaignDto,
  UpdateEmCampaignDto,
  ScheduleEmCampaignDto,
  EmConfigItemDto,
  EmContactDto,
  EmSegmentDto,
  EmTemplateDto,
  EmCampaignDto,
  EmImportResponseDto,
} from "@projects/shared";
import { toast } from "sonner";

type ApiError = {
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
};

// ─── SMTP Config Hooks ──────────────────────────────────────────────────────────

export const useEmConfig = () => {
  return useQuery({
    queryKey: ["em-config"],
    queryFn: async () => await emConfigApi.getAll(),
  });
};

export const useUpdateEmConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: EmConfigItemDto[]) => emConfigApi.updateBatch(items),
    onSuccess: () => {
      toast.success("Đã lưu cấu hình SMTP thành công");
      queryClient.invalidateQueries({ queryKey: ["em-config"] });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Có lỗi xảy ra khi lưu cấu hình");
    },
  });
};

export const useSendTestConfig = () => {
  return useMutation({
    mutationFn: (testEmail: string) => emConfigApi.sendTest(testEmail),
    onSuccess: (data: { message?: string }) => {
      toast.success(data?.message || "Email test đã được gửi thành công");
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Gửi email test thất bại");
    },
  });
};

// ─── Contact Hooks ──────────────────────────────────────────────────────────────

interface UseEmContactsParams {
  page?: number;
  limit?: number;
  search?: string;
  segmentId?: number;
  enabled?: boolean;
}

export const useEmContacts = (params: UseEmContactsParams = {}) => {
  const { enabled, ...restParams } = params;
  return useQuery({
    queryKey: ["em-contacts", restParams],
    queryFn: async () => {
      const res = await emContactApi.getList(restParams);
      return {
        items: res?.data || [],
        meta: res?.meta,
      };
    },
    enabled: enabled !== false,
  });
};

export const useEmContact = (id: number) => {
  return useQuery({
    queryKey: ["em-contact", id],
    queryFn: async () => (await emContactApi.getOne(id)) as EmContactDto,
    enabled: !!id,
  });
};

export const useCreateEmContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmContactDto) => emContactApi.create(data),
    onSuccess: () => {
      toast.success("Đã tạo contact thành công");
      queryClient.invalidateQueries({ queryKey: ["em-contacts"] });
    },
    onError: (error: ApiError) => {
      toast.error(
        error?.response?.data?.message || error?.message || "Có lỗi xảy ra khi tạo contact",
      );
    },
  });
};

export const useUpdateEmContact = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateEmContactDto) => emContactApi.update(id, data),
    onSuccess: () => {
      toast.success("Đã cập nhật contact thành công");
      queryClient.invalidateQueries({ queryKey: ["em-contacts"] });
      queryClient.invalidateQueries({ queryKey: ["em-contact", id] });
    },
    onError: (error: ApiError) => {
      toast.error(
        error?.response?.data?.message || error?.message || "Có lỗi xảy ra khi cập nhật contact",
      );
    },
  });
};

export const useDeleteEmContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => emContactApi.remove(id),
    onSuccess: () => {
      toast.success("Đã xóa contact thành công");
      queryClient.invalidateQueries({ queryKey: ["em-contacts"] });
    },
    onError: (error: ApiError) => {
      toast.error(
        error?.response?.data?.message || error?.message || "Có lỗi xảy ra khi xóa contact",
      );
    },
  });
};

export const useImportEmContacts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => emContactApi.importCsv(file),
    onSuccess: (res: EmImportResponseDto) => {
      toast.success(
        `Import thành công: ${res?.imported || 0} contacts, bỏ qua: ${res?.skipped || 0}`,
      );
      queryClient.invalidateQueries({ queryKey: ["em-contacts"] });
    },
    onError: (error: ApiError) => {
      toast.error(
        error?.response?.data?.message || error?.message || "Có lỗi xảy ra khi import CSV",
      );
    },
  });
};

// ─── Segment Hooks ──────────────────────────────────────────────────────────────

interface UseEmSegmentsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const useEmSegments = (params: UseEmSegmentsParams = {}) => {
  return useQuery({
    queryKey: ["em-segments", params],
    queryFn: async () => {
      const res = await emSegmentApi.getList(params);
      return {
        items: res?.data || [],
        meta: res?.meta,
      };
    },
  });
};

export const useEmSegment = (id: number) => {
  return useQuery({
    queryKey: ["em-segment", id],
    queryFn: async () => (await emSegmentApi.getOne(id)) as EmSegmentDto,
    enabled: !!id,
  });
};

export const useCreateEmSegment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmSegmentDto) => emSegmentApi.create(data),
    onSuccess: () => {
      toast.success("Đã tạo segment thành công");
      queryClient.invalidateQueries({ queryKey: ["em-segments"] });
    },
    onError: (error: ApiError) => {
      toast.error(
        error?.response?.data?.message || error?.message || "Có lỗi xảy ra khi tạo segment",
      );
    },
  });
};

export const useUpdateEmSegment = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateEmSegmentDto) => emSegmentApi.update(id, data),
    onSuccess: () => {
      toast.success("Đã cập nhật segment thành công");
      queryClient.invalidateQueries({ queryKey: ["em-segments"] });
      queryClient.invalidateQueries({ queryKey: ["em-segment", id] });
    },
    onError: (error: ApiError) => {
      toast.error(
        error?.response?.data?.message || error?.message || "Có lỗi xảy ra khi cập nhật segment",
      );
    },
  });
};

export const useDeleteEmSegment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => emSegmentApi.remove(id),
    onSuccess: () => {
      toast.success("Đã xóa segment thành công");
      queryClient.invalidateQueries({ queryKey: ["em-segments"] });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Có lỗi xảy ra khi xóa segment");
    },
  });
};

export const useAssignContactsToSegment = (segmentId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contactIds: number[]) => emSegmentApi.assignContacts(segmentId, contactIds),
    onSuccess: (res: { data?: { added?: number } }) => {
      toast.success(`Đã gán ${res?.data?.added || ""} contacts vào segment`);
      queryClient.invalidateQueries({ queryKey: ["em-segment", segmentId] });
      queryClient.invalidateQueries({ queryKey: ["em-segments"] });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Có lỗi xảy ra khi gán contacts");
    },
  });
};

export const useRemoveContactsFromSegment = (segmentId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contactIds: number[]) => emSegmentApi.removeContacts(segmentId, contactIds),
    onSuccess: (res: { data?: { removed?: number } }) => {
      toast.success(`Đã gỡ ${res?.data?.removed || ""} contacts khỏi segment`);
      queryClient.invalidateQueries({ queryKey: ["em-segment", segmentId] });
      queryClient.invalidateQueries({ queryKey: ["em-segments"] });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Có lỗi xảy ra khi gỡ contacts");
    },
  });
};

// ─── Template Hooks ─────────────────────────────────────────────────────────────

interface UseEmTemplatesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const useEmTemplates = (params: UseEmTemplatesParams = {}) => {
  return useQuery({
    queryKey: ["em-templates", params],
    queryFn: async () => {
      const res = await emTemplateApi.getList(params);
      return {
        items: res?.data || [],
        meta: res?.meta,
      };
    },
  });
};

export const useEmTemplate = (id: number) => {
  return useQuery({
    queryKey: ["em-template", id],
    queryFn: async () => (await emTemplateApi.getOne(id)) as EmTemplateDto,
    enabled: !!id,
  });
};

export const useCreateEmTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmTemplateDto) => emTemplateApi.create(data),
    onSuccess: () => {
      toast.success("Đã tạo template thành công");
      queryClient.invalidateQueries({ queryKey: ["em-templates"] });
    },
    onError: (error: ApiError) => {
      toast.error(
        error?.response?.data?.message || error?.message || "Có lỗi xảy ra khi tạo template",
      );
    },
  });
};

export const useUpdateEmTemplate = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateEmTemplateDto) => emTemplateApi.update(id, data),
    onSuccess: () => {
      toast.success("Đã cập nhật template thành công");
      queryClient.invalidateQueries({ queryKey: ["em-templates"] });
      queryClient.invalidateQueries({ queryKey: ["em-template", id] });
    },
    onError: (error: ApiError) => {
      toast.error(
        error?.response?.data?.message || error?.message || "Có lỗi xảy ra khi cập nhật template",
      );
    },
  });
};

export const useDeleteEmTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => emTemplateApi.remove(id),
    onSuccess: () => {
      toast.success("Đã xóa template thành công");
      queryClient.invalidateQueries({ queryKey: ["em-templates"] });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Có lỗi xảy ra khi xóa template");
    },
  });
};

export const usePreviewEmTemplate = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: PreviewEmTemplateDto }) =>
      await emTemplateApi.preview(id, data),
    onError: (error: ApiError) => {
      toast.error(error?.message || "Có lỗi xảy ra khi preview template");
    },
  });
};

export const useDuplicateEmTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => emTemplateApi.duplicate(id),
    onSuccess: () => {
      toast.success("Đã nhân bản template thành công");
      queryClient.invalidateQueries({ queryKey: ["em-templates"] });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Có lỗi xảy ra khi nhân bản template");
    },
  });
};

export const useSendTestEmTemplate = (id: number) => {
  return useMutation({
    mutationFn: (testEmail: string) => emTemplateApi.sendTest(id, testEmail),
    onSuccess: (data: { message?: string }) => {
      toast.success(data?.message || "Email test đã được gửi thành công");
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Gửi email test thất bại");
    },
  });
};

// ─── Campaign Hooks ─────────────────────────────────────────────────────────────

interface UseEmCampaignsParams {
  page?: number;
  limit?: number;
  status?: string;
}

export const useEmCampaigns = (params: UseEmCampaignsParams = {}) => {
  return useQuery({
    queryKey: ["em-campaigns", params],
    queryFn: async () => {
      const res = await emCampaignApi.getList(params);
      return {
        items: res?.data || [],
        meta: res?.meta,
      };
    },
  });
};

export const useEmCampaign = (id: number) => {
  return useQuery({
    queryKey: ["em-campaign", id],
    queryFn: async () => (await emCampaignApi.getOne(id)) as EmCampaignDto,
    enabled: !!id,
  });
};

export const useCreateEmCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmCampaignDto) => emCampaignApi.create(data),
    onSuccess: () => {
      toast.success("Đã tạo campaign thành công");
      queryClient.invalidateQueries({ queryKey: ["em-campaigns"] });
    },
    onError: (error: ApiError) => {
      toast.error(
        error?.response?.data?.message || error?.message || "Có lỗi xảy ra khi tạo campaign",
      );
    },
  });
};

export const useUpdateEmCampaign = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateEmCampaignDto) => emCampaignApi.update(id, data),
    onSuccess: () => {
      toast.success("Đã cập nhật campaign thành công");
      queryClient.invalidateQueries({ queryKey: ["em-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["em-campaign", id] });
    },
    onError: (error: ApiError) => {
      toast.error(
        error?.response?.data?.message || error?.message || "Có lỗi xảy ra khi cập nhật campaign",
      );
    },
  });
};

export const useDeleteEmCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => emCampaignApi.remove(id),
    onSuccess: () => {
      toast.success("Đã xóa campaign thành công");
      queryClient.invalidateQueries({ queryKey: ["em-campaigns"] });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Có lỗi xảy ra khi xóa campaign");
    },
  });
};

export const useScheduleEmCampaign = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ScheduleEmCampaignDto) => emCampaignApi.schedule(id, data),
    onSuccess: () => {
      toast.success("Đã đặt lịch gửi campaign thành công");
      queryClient.invalidateQueries({ queryKey: ["em-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["em-campaign", id] });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Có lỗi xảy ra khi đặt lịch");
    },
  });
};

export const useCancelEmCampaign = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => emCampaignApi.cancel(id),
    onSuccess: () => {
      toast.success("Đã hủy campaign thành công");
      queryClient.invalidateQueries({ queryKey: ["em-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["em-campaign", id] });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Có lỗi xảy ra khi hủy campaign");
    },
  });
};

export const useSendTestEmCampaign = (id: number) => {
  return useMutation({
    mutationFn: (testEmail: string) => emCampaignApi.sendTest(id, testEmail),
    onSuccess: (data: { message?: string }) => {
      toast.success(data?.message || "Email test đã được gửi");
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Gửi email test thất bại");
    },
  });
};

interface UseEmCampaignLogsParams {
  page?: number;
  limit?: number;
  status?: string;
}

export const useEmCampaignLogs = (id: number, params: UseEmCampaignLogsParams = {}) => {
  return useQuery({
    queryKey: ["em-campaign-logs", id, params],
    queryFn: async () => {
      const res = await emCampaignApi.getLogs(id, params);
      return {
        items: res?.data || [],
        meta: res?.meta,
      };
    },
    enabled: !!id,
  });
};
