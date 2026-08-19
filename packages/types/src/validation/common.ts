import { z } from 'zod';

// Common validation utilities
export const createOptionalField = <T extends z.ZodTypeAny>(schema: T) =>
  schema.optional().or(z.literal('').transform(() => undefined));

export const createNullableField = <T extends z.ZodTypeAny>(schema: T) =>
  schema.nullable().or(z.literal('').transform(() => null));

// Custom validators
export const strongPasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const phoneNumberSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

export const slugSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Must be a valid URL slug (lowercase, hyphens only)');

// File validation helpers
export const createFileSchema = (options: { maxSize?: number; allowedTypes?: string[]; required?: boolean }) => {
  const baseSchema = z.object({
    name: z.string(),
    size: z
      .number()
      .max(
        options.maxSize || 5 * 1024 * 1024,
        `File size must be less than ${(options.maxSize || 5 * 1024 * 1024) / 1024 / 1024}MB`
      ),
    type: options.allowedTypes ? z.enum(options.allowedTypes as [string, ...string[]]) : z.string(),
  });

  return options.required ? baseSchema : baseSchema.optional();
};

// Array validation helpers
export const createUniqueArraySchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z
    .array(itemSchema)
    .refine((items) => new Set(items).size === items.length, { message: 'Array items must be unique' });

// Date validation helpers
export const futureDateSchema = z.date().refine((date) => date > new Date(), { message: 'Date must be in the future' });

export const pastDateSchema = z.date().refine((date) => date < new Date(), { message: 'Date must be in the past' });

export const dateRangeSchema = z
  .object({
    start_date: z.date(),
    end_date: z.date(),
  })
  .refine((data) => data.start_date <= data.end_date, {
    message: 'Start date must be before or equal to end date',
    path: ['end_date'],
  });

// Transform helpers
export const trimAndLowercase = z.string().transform((val) => val.trim().toLowerCase());
export const trimString = z.string().transform((val) => val.trim());
export const parseIntString = z.string().transform((val) => parseInt(val, 10));
export const parseFloatString = z.string().transform((val) => parseFloat(val));

// Sanitization helpers
export const sanitizeHtml = z
  .string()
  .transform((val) => val.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''));

export const sanitizeFileName = z
  .string()
  .transform((val) => val.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/_{2,}/g, '_'));

// Business logic validators
export const currencyAmountSchema = z
  .number()
  .positive('Amount must be positive')
  .multipleOf(0.01, 'Amount can have at most 2 decimal places');

export const percentageSchema = z
  .number()
  .min(0, 'Percentage cannot be negative')
  .max(100, 'Percentage cannot exceed 100');
