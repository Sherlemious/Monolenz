export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  query?: string;
  filters?: Record<string, any>;
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

export interface AuditParams {
  include_deleted?: boolean;
  include_audit_info?: boolean;
}

// Common request patterns
export interface BulkOperation<T> {
  operation: 'create' | 'update' | 'delete';
  items: T[];
}

export interface BatchRequest<T> {
  batch_id?: string;
  operations: BulkOperation<T>[];
}
