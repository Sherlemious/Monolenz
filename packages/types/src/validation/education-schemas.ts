import { z } from 'zod';

/**
 * Education validation schemas - shared between frontend and backend
 */

// Degree type enum
export const degreeTypeEnum = z.enum([
  'Bachelor',
  'Master',
  'PhD',
  'Associate',
  'Certificate',
  'Diploma',
]);

// Base education data validation
export const educationDataSchema = z.object({
  institution_name: z
    .string()
    .min(1, 'Institution name is required')
    .max(255, 'Institution name must be less than 255 characters'),
  institution_url: z
    .string()
    .url('Invalid institution website URL')
    .max(500, 'Institution URL must be less than 500 characters')
    .optional(),
  location: z.string().max(255, 'Location must be less than 255 characters').optional(),
  degree_type: degreeTypeEnum.optional(),
  degree_name: z.string().max(255, 'Degree name must be less than 255 characters').optional(),
  field_of_study: z.string().max(255, 'Field of study must be less than 255 characters').optional(),
  minor_fields: z.array(z.string()).optional(),
  start_date: z.string().date('Invalid start date format').optional(),
  end_date: z.string().date('Invalid end date format').optional(),
  is_current: z.boolean().optional(),
  gpa: z
    .number()
    .min(0, 'GPA must be at least 0')
    .max(4, 'GPA must be at most 4.0')
    .optional(),
  gpa_scale: z
    .number()
    .min(1, 'GPA scale must be at least 1')
    .max(10, 'GPA scale must be at most 10')
    .optional(),
  honors: z.array(z.string()).optional(),
  relevant_coursework: z.array(z.string()).optional(),
  activities: z.array(z.string()).optional(),
});

// Education schemas for different use cases
export const educationSchemas = {
  // For creating a new education entry (required fields enforced)
  create: educationDataSchema.required({
    institution_name: true,
  }),

  // For updating an education entry (all fields optional)
  update: educationDataSchema.partial(),

  // For frontend forms - with better UX (empty strings transformed to undefined)
  createForm: educationDataSchema
    .extend({
      institution_url: z
        .union([z.string().url('Invalid institution website URL').max(500), z.literal('')])
        .transform((val) => val || undefined)
        .optional(),
      location: z.string().transform((val) => val.trim() || undefined).optional(),
      degree_name: z.string().transform((val) => val.trim() || undefined).optional(),
      field_of_study: z.string().transform((val) => val.trim() || undefined).optional(),
      minor_fields: z.array(z.string()).transform((val) => (val.length === 0 ? undefined : val)).optional(),
      honors: z.array(z.string()).transform((val) => (val.length === 0 ? undefined : val)).optional(),
      relevant_coursework: z.array(z.string()).transform((val) => (val.length === 0 ? undefined : val)).optional(),
      activities: z.array(z.string()).transform((val) => (val.length === 0 ? undefined : val)).optional(),
      start_date: z.string().transform((val) => val.trim() || undefined).optional(),
      end_date: z.string().transform((val) => val.trim() || undefined).optional(),
    })
    .required({
      institution_name: true,
    }),

  updateForm: educationDataSchema
    .extend({
      institution_name: z.string().min(1).max(255).optional(),
      institution_url: z
        .union([z.string().url('Invalid institution website URL').max(500), z.literal('')])
        .transform((val) => val || undefined)
        .optional(),
      location: z.string().transform((val) => val.trim() || undefined).optional(),
      degree_name: z.string().transform((val) => val.trim() || undefined).optional(),
      field_of_study: z.string().transform((val) => val.trim() || undefined).optional(),
      minor_fields: z.array(z.string()).transform((val) => (val.length === 0 ? undefined : val)).optional(),
      honors: z.array(z.string()).transform((val) => (val.length === 0 ? undefined : val)).optional(),
      relevant_coursework: z.array(z.string()).transform((val) => (val.length === 0 ? undefined : val)).optional(),
      activities: z.array(z.string()).transform((val) => (val.length === 0 ? undefined : val)).optional(),
      start_date: z.string().transform((val) => val.trim() || undefined).optional(),
      end_date: z.string().transform((val) => val.trim() || undefined).optional(),
    })
    .partial(),

  // For API responses (includes metadata)
  response: educationDataSchema.extend({
    id: z.number().int().positive(),
    block_type_id: z.number().int().positive(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
  }),
};

