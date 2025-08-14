import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { HTTP_STATUS_CODES } from '@monolenz/types/api';

/**
 * Validation middleware factory
 */
export const validate = (schemas: { body?: ZodSchema; query?: ZodSchema; params?: ZodSchema }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    try {
      // Validate body
      if (schemas.body) {
        const result = schemas.body.safeParse(req.body);
        if (!result.success) {
          errors.push(...result.error.errors.map((err) => `Body.${err.path.join('.')}: ${err.message}`));
        } else {
          req.validatedBody = result.data;
        }
      }

      // Validate query
      if (schemas.query) {
        const result = schemas.query.safeParse(req.query);
        if (!result.success) {
          errors.push(...result.error.errors.map((err) => `Query.${err.path.join('.')}: ${err.message}`));
        } else {
          req.validatedQuery = result.data;
        }
      }

      // Validate params
      if (schemas.params) {
        const result = schemas.params.safeParse(req.params);
        if (!result.success) {
          errors.push(...result.error.errors.map((err) => `Params.${err.path.join('.')}: ${err.message}`));
        } else {
          req.validatedParams = result.data;
        }
      }

      if (errors.length > 0) {
        return res.error('Validation failed', HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY, errors);
      }

      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      return res.error('Validation processing failed', HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  };
};

export {
  baseParamSchemas,
  basePaginationSchemas,
  baseSearchSchemas,
  profileSchemas,
  profileLinkSchemas,
  profileFilterSchemas,
  profileLinkFilterSchemas,
} from '@monolenz/types/validation';
