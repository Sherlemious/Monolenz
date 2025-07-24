import { z } from 'zod';

/**
 * Base schemas that can be used across frontend and backend
 */

// Common parameter schemas
export const baseParamSchemas = {
  id: z.string().uuid('Invalid ID format'),
  username: z.string().min(1, 'Username is required'),
  profileId: z.string().uuid('Invalid profile ID format'),
  linkId: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, 'Invalid link ID'),
};

// Pagination schemas
export const basePaginationSchemas = {
  // For API query params (strings that need parsing)
  queryParams: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),

  // For processed pagination (numbers with defaults applied)
  processed: z.object({
    page: z.number().min(1),
    limit: z.number().min(1).max(100),
    sort: z.string(),
    order: z.enum(['asc', 'desc']),
  }),

  // For frontend forms (numbers)
  form: z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(10),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).default('asc'),
  }),
};

// Search schemas
export const baseSearchSchemas = {
  // For API query params
  queryParams: z.object({
    ...basePaginationSchemas.queryParams.shape,
    query: z.string().optional(),
    search: z.string().optional(),
  }),

  // For frontend search forms
  form: z.object({
    search: z.string().min(1, 'Search term is required'),
    filters: z.record(z.string()).optional(),
  }),
};
