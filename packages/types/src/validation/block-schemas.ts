/**
 * Zod validation schemas for typed blocks
 */

import { z } from 'zod';
import { BlockType } from '../entities/blocks';

// ============================================================================
// Reusable Schemas
// ============================================================================

const isoDateSchema = z
  .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD'), z.date()])
  .refine((d) => {
    if (typeof d === 'string') {
      const date = new Date(d);
      return !isNaN(date.getTime());
    }
    return true; // Date objects are always valid
  }, 'Invalid date')
  .transform((d) => {
    // Transform string dates to Date objects for Prisma
    if (typeof d === 'string') {
      return new Date(d);
    }
    // Date objects pass through as-is
    return d;
  });

const urlSchema = z.string().url('Invalid URL').max(500, 'URL must be 500 characters or less').optional().nullable();

const stringArraySchema = z.array(z.string()).default([]);

// ============================================================================
// Work Experience Schema
// ============================================================================

export const workExperienceSchema = z.object({
  company_name: z.string().min(1, 'Company name is required').max(255),
  company_url: urlSchema,
  company_logo_url: urlSchema,
  position_title: z.string().min(1, 'Position title is required').max(255),
  employment_type: z.enum(['full-time', 'part-time', 'contract', 'internship', 'freelance']).optional().nullable(),
  location: z.string().max(255).optional().nullable(),
  location_type: z.enum(['on-site', 'remote', 'hybrid']).optional().nullable(),
  start_date: isoDateSchema,
  end_date: isoDateSchema.optional().nullable(),
  is_current: z.boolean().default(false),
  description: z.string().optional().nullable(),
  achievements: stringArraySchema,
  technologies: stringArraySchema,
});

export type WorkExperienceInput = z.infer<typeof workExperienceSchema>;

// ============================================================================
// Education Schema
// ============================================================================

export const educationSchema = z.object({
  institution_name: z.string().min(1, 'Institution name is required').max(255),
  institution_url: urlSchema,
  degree_type: z.string().max(50).optional().nullable(),
  degree_name: z.string().max(255).optional().nullable(),
  field_of_study: z.string().max(255).optional().nullable(),
  start_date: isoDateSchema.optional().nullable(),
  end_date: isoDateSchema.optional().nullable(),
  is_current: z.boolean().default(false),
  gpa: z.number().min(0).max(10).optional().nullable(),
  gpa_scale: z.number().default(4.0),
  honors: stringArraySchema,
  relevant_coursework: stringArraySchema,
  location: z.string().max(255).optional().nullable(),
});

export type EducationInput = z.infer<typeof educationSchema>;

// ============================================================================
// Skill Schema
// ============================================================================

export const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required').max(255),
  category: z.string().min(1, 'Category is required').max(50),
  proficiency_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional().nullable(),
  years_experience: z.number().min(0).max(100).optional().nullable(),
});

export type SkillInput = z.infer<typeof skillSchema>;

// ============================================================================
// Project Schema
// ============================================================================

export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255),
  description: z.string().optional().nullable(),
  url: urlSchema,
  repository_url: urlSchema,
  image_url: urlSchema,
  start_date: isoDateSchema.optional().nullable(),
  end_date: isoDateSchema.optional().nullable(),
  is_ongoing: z.boolean().default(false),
  technologies: stringArraySchema,
  highlights: stringArraySchema,
});

export type ProjectInput = z.infer<typeof projectSchema>;

// ============================================================================
// Certification Schema
// ============================================================================

export const certificationSchema = z.object({
  name: z.string().min(1, 'Certification name is required').max(255),
  issuing_organization: z.string().min(1, 'Issuing organization is required').max(255),
  organization_url: urlSchema,
  credential_id: z.string().max(255).optional().nullable(),
  credential_url: urlSchema,
  issue_date: isoDateSchema.optional().nullable(),
  expiration_date: isoDateSchema.optional().nullable(),
  does_not_expire: z.boolean().default(false),
});

export type CertificationInput = z.infer<typeof certificationSchema>;

// ============================================================================
// Language Schema
// ============================================================================

export const languageSchema = z.object({
  language: z.string().min(1, 'Language is required').max(100),
  proficiency: z.enum(['native', 'fluent', 'professional', 'intermediate', 'basic']),
});

export type LanguageInput = z.infer<typeof languageSchema>;

// ============================================================================
// Volunteer Schema
// ============================================================================

export const volunteerSchema = z.object({
  organization_name: z.string().min(1, 'Organization name is required').max(255),
  role: z.string().min(1, 'Role is required').max(255),
  cause: z.string().max(255).optional().nullable(),
  start_date: isoDateSchema.optional().nullable(),
  end_date: isoDateSchema.optional().nullable(),
  is_current: z.boolean().default(false),
  description: z.string().optional().nullable(),
  highlights: stringArraySchema,
});

export type VolunteerInput = z.infer<typeof volunteerSchema>;

// ============================================================================
// Award Schema
// ============================================================================

export const awardSchema = z.object({
  title: z.string().min(1, 'Award title is required').max(255),
  issuer: z.string().max(255).optional().nullable(),
  date_received: isoDateSchema.optional().nullable(),
  description: z.string().optional().nullable(),
  url: urlSchema,
});

export type AwardInput = z.infer<typeof awardSchema>;

// ============================================================================
// Schema Map for Dynamic Validation
// ============================================================================

export const BLOCK_SCHEMAS: Record<BlockType, z.ZodSchema> = {
  [BlockType.WORK_EXPERIENCE]: workExperienceSchema,
  [BlockType.EDUCATION]: educationSchema,
  [BlockType.SKILL]: skillSchema,
  [BlockType.PROJECT]: projectSchema,
  [BlockType.CERTIFICATION]: certificationSchema,
  [BlockType.LANGUAGE]: languageSchema,
  [BlockType.VOLUNTEER]: volunteerSchema,
  [BlockType.AWARD]: awardSchema,
};

// ============================================================================
// Request Schemas
// ============================================================================

// Discriminated union for create block
export const createBlockSchema = z.discriminatedUnion('block_type', [
  z.object({
    block_type: z.literal(BlockType.WORK_EXPERIENCE),
    data: workExperienceSchema,
    section_name: z.string().max(255).optional(),
    sort_order: z.number().int().min(0).optional(),
  }),
  z.object({
    block_type: z.literal(BlockType.EDUCATION),
    data: educationSchema,
    section_name: z.string().max(255).optional(),
    sort_order: z.number().int().min(0).optional(),
  }),
  z.object({
    block_type: z.literal(BlockType.SKILL),
    data: skillSchema,
    section_name: z.string().max(255).optional(),
    sort_order: z.number().int().min(0).optional(),
  }),
  z.object({
    block_type: z.literal(BlockType.PROJECT),
    data: projectSchema,
    section_name: z.string().max(255).optional(),
    sort_order: z.number().int().min(0).optional(),
  }),
  z.object({
    block_type: z.literal(BlockType.CERTIFICATION),
    data: certificationSchema,
    section_name: z.string().max(255).optional(),
    sort_order: z.number().int().min(0).optional(),
  }),
  z.object({
    block_type: z.literal(BlockType.LANGUAGE),
    data: languageSchema,
    section_name: z.string().max(255).optional(),
    sort_order: z.number().int().min(0).optional(),
  }),
  z.object({
    block_type: z.literal(BlockType.VOLUNTEER),
    data: volunteerSchema,
    section_name: z.string().max(255).optional(),
    sort_order: z.number().int().min(0).optional(),
  }),
  z.object({
    block_type: z.literal(BlockType.AWARD),
    data: awardSchema,
    section_name: z.string().max(255).optional(),
    sort_order: z.number().int().min(0).optional(),
  }),
]);

export type CreateBlockInput = z.infer<typeof createBlockSchema>;

// Batch version update schema
export const batchVersionUpdateSchema = z.object({
  creations: z.array(createBlockSchema).default([]),
  updates: z
    .array(
      z.object({
        parent_block_id: z.number().int().positive('Parent block ID must be positive'),
        block_type: z.nativeEnum(BlockType),
        data: z.any(),
        section_name: z.string().max(255).optional(),
        sort_order: z.number().int().min(0).optional(),
      })
    )
    .default([]),
  deletions: z.array(z.number().int().positive()).default([]),
});

export type BatchVersionUpdateInput = z.infer<typeof batchVersionUpdateSchema>;

// ============================================================================
// Query & Param Schemas
// ============================================================================

export const versionIdParamsSchema = z.object({
  versionId: z.coerce.number().int().positive('Version ID must be positive'),
  identifier: z.string().optional(),
});

export const listBlocksQuerySchema = z.object({
  section_name: z.string().optional(),
  block_type: z.nativeEnum(BlockType).optional(),
});

export type ListBlocksQuery = z.infer<typeof listBlocksQuerySchema>;
