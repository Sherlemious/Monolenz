import { Router } from 'express';
import { profileController } from '../../../controllers';
import { authenticate, optionalAuth, requireProfile } from '../../../middleware/auth';
import { validate } from '../../../middleware/validation';
import { profileSchemas, baseParamSchemas } from '@athaar/types/validation';
import { z } from 'zod';

const router: Router = Router();

// Public routes (no auth)
router.get(
  '/public/:identifier',
  validate({
    params: z.object({ identifier: z.string().min(1) }),
  }),
  profileController.getPublicProfile
);

router.get(
  '/search',
  optionalAuth, // Optional for better search experience
  validate({
    query: z.object({
      search: z.string().optional(),
      page: z.string().optional(),
      limit: z.string().optional(),
      sort: z.string().optional(),
      order: z.enum(['asc', 'desc']).optional(),
    }),
  }),
  profileController.searchProfiles
);

router.get(
  '/username/:username/availability',
  optionalAuth,
  validate({
    params: z.object({ username: z.string().min(3).max(50) }),
  }),
  profileController.checkUsername
);

// Protected routes (auth required)
router.use(authenticate);

router.post('/', validate({ body: profileSchemas.create }), profileController.createProfile);

router.get('/me', requireProfile, profileController.getMyProfile);

router.get('/me/stats', requireProfile, profileController.getProfileStats);

router.put('/me', requireProfile, validate({ body: profileSchemas.update }), profileController.updateProfile);

router.delete('/me', requireProfile, profileController.deleteProfile);

router.get(
  '/:identifier',
  validate({
    params: z.object({ identifier: z.string().min(1) }),
    query: z.object({ include_links: z.enum(['true', 'false']).optional() }),
  }),
  profileController.getProfile
);

export default router;
