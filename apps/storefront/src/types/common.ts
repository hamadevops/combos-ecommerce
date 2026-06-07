export interface BaseResponse<T> {
  traceId: string;
  success: boolean;
  message: string;
  data: T;
  meta?: any;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends BaseResponse<T[]> {
  data: T[];
  meta: PaginationMeta;
}
