import { Request, Response, Router } from 'express';
import { asyncHandler } from '../../../utils/async-handler';
import { validate } from '../../../middleware/validation';
import { authenticate, optionalAuth } from '../../../middleware/auth';
import { profileBlockSchemas } from '@monolenz/types/validation';
import { profileBlockController } from '../../../controllers/profile/profile-block';

export const profileBlockRouter: Router = Router();

// List block types
profileBlockRouter.get('/block-types', optionalAuth, profileBlockController.listBlockTypes);

// List block properties of a type
profileBlockRouter.get(
  '/block-types/:id/properties',
  optionalAuth,
  validate({ params: profileBlockSchemas.catalog.blockTypePropsParams }),
  profileBlockController.listBlockProperties
);

// Create new version (batch save)
profileBlockRouter.post(
  '/me/versions',
  authenticate,
  validate({ body: profileBlockSchemas.batchUpdate.body }),
  profileBlockController.applyVersionUpdate
);

// List blocks for version (public)
profileBlockRouter.get(
  '/:identifier/versions/:versionId/blocks',
  validate({
    params: profileBlockSchemas.listVersionBlocks.params,
    query: profileBlockSchemas.listVersionBlocks.query,
  }),
  profileBlockController.listBlocksForVersion
);
