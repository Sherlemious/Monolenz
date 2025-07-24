import { ApiResponse, PaginationParams } from '@athaar/types';
import type { User } from '@supabase/supabase-js';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      // Auth-related (you already have some of these)
      user?: User;
      userId?: string;
      userRole?: string;

      // Request processing
      requestId: string;
      startTime: Date;

      // Pagination & filtering
      paginationQuery: IPaginationQuery;
      filters: Record<string, any>;

      // Validation
      validatedBody?: any;
      validatedQuery?: any;
      validatedParams?: any;

      // Custom metadata
      metadata: Record<string, any>;
    }

    interface Response {
      // Custom response methods
      success<T>(data: T, message?: string): Response;
      error(message: string, statusCode?: number, errors?: string[]): Response;
      paginated<T>(data: T[], meta: IPaginationMeta, message?: string): Response;
    }
  }
}

export interface IPaginationQuery extends PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order: 'asc' | 'desc';
  search?: string;
}

export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
