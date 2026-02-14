import { z } from 'zod';

export const identifierParamsSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Identifier is required')
    .max(100, 'Identifier must be less than 100 characters'),
});

export const searchQuerySchema = z.object({
  search: z.string().max(100, 'Search term too long').optional(),
  query: z.string().max(100, 'Query term too long').optional(),
  page: z.coerce.number().int().min(1, 'Page must be greater than 0').optional(),
  limit: z.coerce
    .number()
    .int()
    .min(1, 'Limit must be greater than 0')
    .max(100, 'Limit must be less than 100')
    .optional(),
  sort: z.enum(['username', 'created_at', 'updated_at'], {
    errorMap: () => ({ message: 'Invalid sort field' }),
  }).optional(),
  order: z.enum(['asc', 'desc'], {
    errorMap: () => ({ message: 'Invalid sort order' }),
  }).optional(),
});

export const getProfileQuerySchema = z.object({
  include_links: z.enum(['true', 'false']).optional(),
});

export const usernameParamsSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
});
