import { PaginationParams } from '@monolenz/types/api';
import type { AuthUser } from '../config/auth';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      userId?: string;
      userRole?: string;

      // Request processing
      requestId: string;
      startTime: Date;

      // Processed pagination/search params with defaults applied
      pagination: ProcessedPaginationParams;
      searchParams: ProcessedSearchParams;

      // Validation results
      validatedBody?: any;
      validatedQuery?: any;
      validatedParams?: any;

      // Custom metadata
      metadata: Record<string, any>;
    }

    interface Response {
      success<T>(data: T, message?: string): Response;
      error(message: string, statusCode?: number, errors?: string[]): Response;
      paginated<T>(data: T[], total: number, message?: string): Response;
    }
  }
}

// Processed versions where optional fields become required with defaults
export interface ProcessedPaginationParams extends Required<PaginationParams> {
  page: number; // always a number >= 1
  limit: number; // always a number 1-100
  sort: string; // empty string if not provided
  order: 'asc' | 'desc'; // defaults to 'asc'
}

export interface ProcessedSearchParams extends ProcessedPaginationParams {
  query: string; // empty string if not provided
  search: string; // alias for query, empty string if not provided
  filters: Record<string, any>; // all other query params
}
