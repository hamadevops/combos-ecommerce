import {
  emConfigFindAll,
  emConfigUpdateBatch,
  emConfigSendTest,
  emContactFindAll,
  emContactFindOne,
  emContactCreate,
  emContactUpdate,
  emContactRemove,
  emContactImportCsv,
  emSegmentFindAll,
  emSegmentFindOne,
  emSegmentCreate,
  emSegmentUpdate,
  emSegmentRemove,
  emSegmentAssignContacts,
  emSegmentRemoveContacts,
  emTemplateFindAll,
  emTemplateFindOne,
  emTemplateCreate,
  emTemplateUpdate,
  emTemplateRemove,
  emTemplatePreview,
  emTemplateDuplicate,
  emTemplateSendTest,
  emCampaignFindAll,
  emCampaignFindOne,
  emCampaignCreate,
  emCampaignUpdate,
  emCampaignRemove,
  emCampaignSchedule,
  emCampaignCancel,
  emCampaignSendTest,
  emCampaignGetLogs,
  type CreateEmContactDto,
  type UpdateEmContactDto,
  type CreateEmSegmentDto,
  type UpdateEmSegmentDto,
  type CreateEmTemplateDto,
  type UpdateEmTemplateDto,
  type PreviewEmTemplateDto,
  type SendTestEmTemplateDto,
  type CreateEmCampaignDto,
  type UpdateEmCampaignDto,
  type ScheduleEmCampaignDto,
  type EmConfigItemDto,
  type EmConfigFindAllResponses,
  type EmConfigSendTestResponses,
  type EmConfigUpdateBatchResponses,
  type EmContactFindAllResponses,
  type EmContactFindOneResponses,
  type EmContactCreateResponses,
  type EmContactUpdateResponses,
  type EmContactRemoveResponses,
  type EmContactImportCsvResponses,
  type EmSegmentFindAllResponses,
  type EmSegmentFindOneResponses,
  type EmSegmentCreateResponses,
  type EmSegmentUpdateResponses,
  type EmSegmentRemoveResponses,
  type EmSegmentAssignContactsResponses,
  type EmSegmentRemoveContactsResponses,
  type EmTemplateFindAllResponses,
  type EmTemplateFindOneResponses,
  type EmTemplateCreateResponses,
  type EmTemplateUpdateResponses,
  type EmTemplateRemoveResponses,
  type EmTemplatePreviewResponses,
  type EmTemplateDuplicateResponses,
  type EmTemplateSendTestResponses,
  type EmCampaignFindAllResponses,
  type EmCampaignFindOneResponses,
  type EmCampaignCreateResponses,
  type EmCampaignUpdateResponses,
  type EmCampaignRemoveResponses,
  type EmCampaignScheduleResponses,
  type EmCampaignCancelResponses,
  type EmCampaignSendTestResponses,
  type EmCampaignGetLogsResponses,
} from "@projects/shared";

// Helper to unwrap standard response or throw error
const request = async <T, E = unknown>(
  promise: Promise<{ data?: T; error?: E }>,
): Promise<T> => {
  const { data, error } = await promise;
  if (error) {
    throw error;
  }
  return data as T;
};

// ─── SMTP Config ────────────────────────────────────────────────────────────────

export const emConfigApi = {
  getAll: () => {
    return request<EmConfigFindAllResponses[200]>(emConfigFindAll());
  },

  updateBatch: (items: EmConfigItemDto[]) => {
    return request<EmConfigUpdateBatchResponses[200]>(
      emConfigUpdateBatch({
        body: { items },
      }),
    );
  },

  sendTest: (testEmail: string) => {
    return request<EmConfigSendTestResponses[201]>(
      emConfigSendTest({
        body: { testEmail },
      }),
    );
  },
};

// ─── Contacts ───────────────────────────────────────────────────────────────────

export const emContactApi = {
  getList: (params?: { page?: number; limit?: number; search?: string; segmentId?: number }) => {
    return request<EmContactFindAllResponses[200]>(
      emContactFindAll({
        query: {
          page: params?.page,
          limit: params?.limit,
          search: params?.search,
          segmentId: params?.segmentId,
        },
      }),
    );
  },

  getOne: (id: number) => {
    return request<EmContactFindOneResponses[200]>(
      emContactFindOne({
        path: { id },
      }),
    );
  },

  create: (data: CreateEmContactDto) => {
    return request<EmContactCreateResponses[201]>(
      emContactCreate({
        body: data,
      }),
    );
  },

  update: (id: number, data: UpdateEmContactDto) => {
    return request<EmContactUpdateResponses[200]>(
      emContactUpdate({
        path: { id },
        body: data,
      }),
    );
  },

  remove: (id: number) => {
    return request<EmContactRemoveResponses[200]>(
      emContactRemove({
        path: { id },
      }),
    );
  },

  importCsv: (file: File) => {
    return request<EmContactImportCsvResponses[200]>(
      emContactImportCsv({
        body: { file } as any,
      }),
    );
  },
};

// ─── Segments ───────────────────────────────────────────────────────────────────

export const emSegmentApi = {
  getList: (params?: { page?: number; limit?: number; search?: string }) => {
    return request<EmSegmentFindAllResponses[200]>(
      emSegmentFindAll({
        query: {
          page: params?.page,
          limit: params?.limit,
          search: params?.search,
        },
      }),
    );
  },

  getAll: () => {
    return request<EmSegmentFindAllResponses[200]>(emSegmentFindAll({ query: {} }));
  },

  getOne: (id: number) => {
    return request<EmSegmentFindOneResponses[200]>(
      emSegmentFindOne({
        path: { id },
      }),
    );
  },

  create: (data: CreateEmSegmentDto) => {
    return request<EmSegmentCreateResponses[201]>(
      emSegmentCreate({
        body: data,
      }),
    );
  },

  update: (id: number, data: UpdateEmSegmentDto) => {
    return request<EmSegmentUpdateResponses[200]>(
      emSegmentUpdate({
        path: { id },
        body: data,
      }),
    );
  },

  remove: (id: number) => {
    return request<EmSegmentRemoveResponses[200]>(
      emSegmentRemove({
        path: { id },
      }),
    );
  },

  assignContacts: (segmentId: number, contactIds: number[]) => {
    return request<EmSegmentAssignContactsResponses[201]>(
      emSegmentAssignContacts({
        path: { id: segmentId },
        body: { contactIds: contactIds.map(String) },
      }),
    );
  },

  removeContacts: (segmentId: number, contactIds: number[]) => {
    return request<EmSegmentRemoveContactsResponses[200]>(
      emSegmentRemoveContacts({
        path: { id: segmentId },
        body: { contactIds: contactIds.map(String) },
      }),
    );
  },
};

// ─── Templates ──────────────────────────────────────────────────────────────────

export const emTemplateApi = {
  getList: (params?: { page?: number; limit?: number; search?: string }) => {
    return request<EmTemplateFindAllResponses[200]>(
      emTemplateFindAll({
        query: {
          page: params?.page,
          limit: params?.limit,
          search: params?.search,
        },
      }),
    );
  },

  getOne: (id: number) => {
    return request<EmTemplateFindOneResponses[200]>(
      emTemplateFindOne({
        path: { id },
      }),
    );
  },

  create: (data: CreateEmTemplateDto) => {
    return request<EmTemplateCreateResponses[201]>(
      emTemplateCreate({
        body: data,
      }),
    );
  },

  update: (id: number, data: UpdateEmTemplateDto) => {
    return request<EmTemplateUpdateResponses[200]>(
      emTemplateUpdate({
        path: { id },
        body: data,
      }),
    );
  },

  remove: (id: number) => {
    return request<EmTemplateRemoveResponses[200]>(
      emTemplateRemove({
        path: { id },
      }),
    );
  },

  preview: (id: number, data: PreviewEmTemplateDto) => {
    return request<EmTemplatePreviewResponses[201]>(
      emTemplatePreview({
        path: { id },
        body: data,
      }),
    );
  },

  duplicate: (id: number) => {
    return request<EmTemplateDuplicateResponses[201]>(
      emTemplateDuplicate({
        path: { id },
      }),
    );
  },

  sendTest: (id: number, testEmail: string) => {
    return request<EmTemplateSendTestResponses[201]>(
      emTemplateSendTest({
        path: { id },
        body: { testEmail },
      }),
    );
  },
};

// ─── Campaigns ──────────────────────────────────────────────────────────────────

export const emCampaignApi = {
  getList: (params?: { page?: number; limit?: number; status?: string }) => {
    return request<EmCampaignFindAllResponses[200]>(
      emCampaignFindAll({
        query: {
          page: params?.page,
          limit: params?.limit,
          status: params?.status,
        },
      }),
    );
  },

  getOne: (id: number) => {
    return request<EmCampaignFindOneResponses[200]>(
      emCampaignFindOne({
        path: { id },
      }),
    );
  },

  create: (data: CreateEmCampaignDto) => {
    return request<EmCampaignCreateResponses[201]>(
      emCampaignCreate({
        body: {
          ...data,
          segmentIds: data.segmentIds.map(String),
        },
      }),
    );
  },

  update: (id: number, data: UpdateEmCampaignDto) => {
    return request<EmCampaignUpdateResponses[200]>(
      emCampaignUpdate({
        path: { id },
        body: {
          ...data,
          segmentIds: data.segmentIds?.map(String),
        },
      }),
    );
  },

  remove: (id: number) => {
    return request<EmCampaignRemoveResponses[200]>(
      emCampaignRemove({
        path: { id },
      }),
    );
  },

  schedule: (id: number, data: ScheduleEmCampaignDto) => {
    return request<EmCampaignScheduleResponses[201]>(
      emCampaignSchedule({
        path: { id },
        body: data,
      }),
    );
  },

  cancel: (id: number) => {
    return request<EmCampaignCancelResponses[201]>(
      emCampaignCancel({
        path: { id },
      }),
    );
  },

  sendTest: (id: number, testEmail: string) => {
    return request<EmCampaignSendTestResponses[201]>(
      emCampaignSendTest({
        path: { id },
        body: { testEmail },
      }),
    );
  },

  getLogs: (
    id: number,
    params?: {
      page?: number;
      limit?: number;
      status?: string;
    },
  ) => {
    return request<EmCampaignGetLogsResponses[200]>(
      emCampaignGetLogs({
        path: { id },
        query: {
          page: params?.page,
          limit: params?.limit,
          status: params?.status,
        },
      }),
    );
  },
};
