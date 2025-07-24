import { z } from 'zod';

/**
 * Profile validation schemas - shared between frontend and backend
 */

// Base profile data validation
export const profileDataSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  profile_picture_url: z.string().url('Invalid profile picture URL').optional(),
  linkedin_url: z.string().url('Invalid LinkedIn URL').optional(),
  github_url: z.string().url('Invalid GitHub URL').optional(),
  portfolio_url: z.string().url('Invalid portfolio URL').optional(),
});

// Profile schemas for different use cases
export const profileSchemas = {
  // For creating a new profile (all fields required except optional ones)
  create: profileDataSchema.required({
    username: true,
  }),

  // For updating a profile (all fields optional)
  update: profileDataSchema.partial(),

  // For frontend forms - with better UX (empty strings transformed to undefined)
  createForm: profileDataSchema
    .extend({
      bio: z
        .string()
        .transform((val) => val.trim() || undefined)
        .optional(),
      profile_picture_url: z
        .string()
        .transform((val) => val.trim() || undefined)
        .optional(),
      linkedin_url: z
        .string()
        .transform((val) => val.trim() || undefined)
        .optional(),
      github_url: z
        .string()
        .transform((val) => val.trim() || undefined)
        .optional(),
      portfolio_url: z
        .string()
        .transform((val) => val.trim() || undefined)
        .optional(),
    })
    .required({
      username: true,
    }),

  updateForm: profileDataSchema
    .extend({
      bio: z
        .string()
        .transform((val) => val.trim() || undefined)
        .optional(),
      profile_picture_url: z
        .string()
        .transform((val) => val.trim() || undefined)
        .optional(),
      linkedin_url: z
        .string()
        .transform((val) => val.trim() || undefined)
        .optional(),
      github_url: z
        .string()
        .transform((val) => val.trim() || undefined)
        .optional(),
      portfolio_url: z
        .string()
        .transform((val) => val.trim() || undefined)
        .optional(),
    })
    .partial(),

  // For API responses (includes metadata)
  response: profileDataSchema.extend({
    id: z.string().uuid(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
  }),

  // Public profile (subset of fields)
  public: profileDataSchema.pick({
    username: true,
    bio: true,
    portfolio_url: true,
  }),
};

// Profile search and filtering
export const profileFilterSchemas = {
  // API query filters
  query: z.object({
    username: z.string().optional(),
    has_bio: z.enum(['true', 'false']).optional(),
    verified: z.enum(['true', 'false']).optional(),
  }),

  // Frontend filter form
  form: z.object({
    search: z.string().optional(),
    hasPortfolio: z.boolean().optional(),
    verified: z.boolean().optional(),
  }),
};
