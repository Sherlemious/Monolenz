import { z } from 'zod';

/**
 * Profile link validation schemas
 */

// Base profile link data
export const profileLinkDataSchema = z.object({
  platform_id: z.number().int().positive('Invalid platform ID').optional(),
  url: z.string().url('Invalid URL format'),
  category: z.string().max(100, 'Category must be less than 100 characters').optional(),
  is_public: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
});

// Profile link schemas
export const profileLinkSchemas = {
  // For creating new links
  create: profileLinkDataSchema,

  // For updating links (all optional except maybe URL)
  update: profileLinkDataSchema.partial(),

  // For frontend forms
  createForm: profileLinkDataSchema.extend({
    // Transform empty strings to undefined for better UX
    category: z
      .string()
      .transform((val) => val.trim() || undefined)
      .optional(),
  }),

  updateForm: profileLinkDataSchema
    .extend({
      category: z
        .string()
        .transform((val) => val.trim() || undefined)
        .optional(),
    })
    .partial(),

  // For API responses
  response: profileLinkDataSchema.extend({
    id: z.number().int().positive(),
    profile_id: z.string().uuid(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
    link_platforms: z
      .object({
        id: z.number(),
        name: z.string(),
        display_name: z.string(),
        category: z.string().optional(),
        icon: z.string().optional(),
      })
      .optional(),
  }),
};

// Profile link filtering
export const profileLinkFilterSchemas = {
  // API query filters
  query: z.object({
    category: z.string().optional(),
    is_public: z.enum(['true', 'false']).optional(),
    platform_id: z
      .string()
      .transform((val) => parseInt(val, 10))
      .refine((val) => !isNaN(val), 'Invalid platform ID')
      .optional(),
  }),

  // Frontend filter form
  form: z.object({
    category: z.string().optional(),
    isPublic: z.boolean().optional(),
    platformId: z.number().optional(),
  }),
};
