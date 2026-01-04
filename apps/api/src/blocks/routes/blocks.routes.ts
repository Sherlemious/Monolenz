/**
 * Block routes
 */

import { Router } from 'express';
import { authenticate, optionalAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { profileBlockController } from '../controllers/profile-block.controller';
import { batchVersionUpdateSchema, listBlocksQuerySchema } from '@monolenz/types/validation/block-schemas';
import { z } from 'zod';

const router = Router();

// ============================================================================
// Public Routes (Optional Authentication)
// ============================================================================

/**
 * GET /:identifier/versions/latest
 * Get the latest version and its blocks for a profile (public)
 */
router.get(
  '/:identifier/versions/latest',
  optionalAuth,
  validate({
    params: z.object({
      identifier: z.string(),
    }),
  }),
  profileBlockController.getLatestVersion
);

/**
 * GET /:identifier/versions/:versionId/blocks
 * List blocks for a specific version (public)
 */
router.get(
  '/:identifier/versions/:versionId/blocks',
  optionalAuth,
  validate({
    params: z.object({
      identifier: z.string(),
      versionId: z.coerce.number().int().positive(),
    }),
    query: listBlocksQuerySchema,
  }),
  profileBlockController.listBlocksForVersion
);

// ============================================================================
// Protected Routes (Authentication Required)
// ============================================================================

router.use(authenticate);

/**
 * POST /me/versions
 * Apply batch version update (creations, updates, deletions)
 */
router.post('/me/versions', validate({ body: batchVersionUpdateSchema }), profileBlockController.applyVersionUpdate);

export default router;
