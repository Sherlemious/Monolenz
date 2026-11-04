import { z } from 'zod';
import { RESUME_TEMPLATE_IDS } from '../entities/resume';

export const resumeTemplateIdSchema = z.enum(RESUME_TEMPLATE_IDS);

export const resumeCreateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255).optional(),
  template_id: resumeTemplateIdSchema.optional(),
  block_ids: z.array(z.number().int().positive()).min(1, 'Select at least one entry').optional(),
});

export const resumeUpdateSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(255).optional(),
    template_id: resumeTemplateIdSchema.optional(),
    block_ids: z.array(z.number().int().positive()).min(1, 'Select at least one entry').optional(),
  })
  .refine((data) => data.name !== undefined || data.template_id !== undefined || data.block_ids !== undefined, {
    message: 'Provide at least one field to update',
  });

export const resumeIdParamsSchema = z.object({
  id: z.string().uuid('Resume ID must be a UUID'),
});

export const resumeTailorSchema = z.object({
  job_description: z
    .string()
    .trim()
    .min(200, 'Paste a fuller job description (at least 200 characters)')
    .max(12_000, 'Job description must be 12,000 characters or less'),
});

export const tailorBulletSchema = z.object({
  text: z.string().trim().min(1).max(600),
  recommended: z.boolean().default(true),
});

export const tailorProposalEntrySchema = z.object({
  source_block_id: z.number().int().positive(),
  include: z.boolean(),
  reason: z.string().trim().max(400).optional().nullable(),
  bullets: z
    .array(tailorBulletSchema)
    .nullish()
    .transform((value) => value ?? []),
});

export const tailorProposalSchema = z.object({
  suggested_name: z.string().trim().min(1).max(255),
  entries: z.array(tailorProposalEntrySchema).min(1),
});

export const tailorApplySelectionSchema = z.object({
  source_block_id: z.number().int().positive(),
  bullets: z.array(z.string().trim().min(1).max(600)).optional(),
});

export const resumeTailorApplySchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  template_id: resumeTemplateIdSchema.optional(),
  selections: z.array(tailorApplySelectionSchema).min(1, 'Select at least one entry'),
});

export type ResumeCreateInput = z.infer<typeof resumeCreateSchema>;
export type ResumeUpdateInput = z.infer<typeof resumeUpdateSchema>;
export type ResumeTailorInput = z.infer<typeof resumeTailorSchema>;
export type ResumeTailorApplyInput = z.infer<typeof resumeTailorApplySchema>;

export const resumeSchemas = {
  create: resumeCreateSchema,
  update: resumeUpdateSchema,
  idParams: resumeIdParamsSchema,
  tailor: resumeTailorSchema,
  tailorApply: resumeTailorApplySchema,
  proposal: tailorProposalSchema,
};
