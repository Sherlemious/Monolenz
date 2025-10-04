import { z } from 'zod';
import { extendZodWithOpenApi} from '@asteasolutions/zod-to-openapi';
extendZodWithOpenApi(z);
/**
 * Profile validation schemas - shared between frontend and backend
 */

// Base profile data validation
export const profileDataSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .openapi({
      example: 'john_doe_123',
      description: 'Unique username (letters, numbers, underscores, and hyphens only)',
    }),
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional()
    .openapi({
      example: 'Full-stack developer passionate about web technologies',
      description: 'User biography',
    }),
  profile_picture_url: z
    .string()
    .url('Invalid profile picture URL')
    .optional()
    .openapi({
      example: 'https://example.com/avatar.jpg',
      description: 'URL to profile picture',
    }),
  linkedin_url: z
    .string()
    .url('Invalid LinkedIn URL')
    .optional()
    .openapi({
      example: 'https://linkedin.com/in/johndoe',
      description: 'LinkedIn profile URL',
    }),
  github_url: z
    .string()
    .url('Invalid GitHub URL')
    .optional()
    .openapi({
      example: 'https://github.com/johndoe',
      description: 'GitHub profile URL',
    }),
  portfolio_url: z
    .string()
    .url('Invalid portfolio URL')
    .optional()
    .openapi({
      example: 'https://johndoe.dev',
      description: 'Portfolio website URL',
    }),
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
    id: z.string().uuid().openapi({
      example: '550e8400-e29b-41d4-a716-446655440000',
      description: 'Profile ID (same as user ID)',
    }),
    created_at: z.string().datetime().openapi({
      example: '2024-01-01T12:00:00Z',
      description: 'Profile creation timestamp',
    }),
    updated_at: z.string().datetime().openapi({
      example: '2024-01-01T12:00:00Z',
      description: 'Profile last update timestamp',
    }),
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
