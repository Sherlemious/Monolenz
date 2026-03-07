import { Router } from 'express';
import { profileController } from '../../../controllers/profile';
import { authenticate, optionalAuth } from '../../../middleware/auth';
import { validate } from '../../../middleware/validation';
import { profileSchemas } from '@monolenz/types/validation';
import { z } from 'zod';
import profileBlockRouter from './blocks.routes';
import { listPlatforms } from '../../../controllers/profile/profile';

const linkInputSchema = z.string().trim().min(1, 'URL is required').max(500, 'URL is too long');

const router: Router = Router();

// Platforms (public, no auth)
router.get('/platforms', listPlatforms);

// Public routes (no auth)
router.get(
  '/public/:identifier',
  validate({
    params: z.object({
      identifier: z.string().min(1, 'Identifier is required'),
    }),
  }),
  profileController.getPublicProfile
);

router.get(
  '/search',
  optionalAuth, // Optional for better search experience
  validate({
    query: z.object({
      search: z.string().optional(),
      query: z.string().optional(),
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
    params: z.object({
      username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(50, 'Username must be less than 50 characters')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
    }),
  }),
  profileController.checkUsername
);

// Profile blocks routes (some endpoints are public with optional auth)
router.use('/', profileBlockRouter);

// Protected routes (auth required)
router.use(authenticate);

router.post(
  '/',
  validate({
    body: profileSchemas.create,
  }),
  profileController.createProfile
);

router.get('/me', profileController.getMyProfile);

router.put(
  '/me',
  validate({
    body: profileSchemas.update,
  }),
  profileController.updateProfile
);

router.delete('/me', profileController.deleteProfile);

router.get('/me/links', profileController.getMyLinks);

router.put(
  '/me/links',
  validate({
    body: z.array(
      z.object({
        id: z.number().int().positive().optional(),
        platform_id: z.number().int().positive().nullable().optional(),
        url: linkInputSchema,
        label: z.string().max(100).nullable().optional(),
        is_public: z.boolean().optional(),
        sort_order: z.number().int().min(0).optional(),
      })
    ),
  }),
  profileController.syncMyLinks
);

router.get(
  '/:identifier',
  validate({
    params: z.object({
      identifier: z.string().min(1, 'Identifier is required'),
    }),
    query: z.object({
      include_links: z.enum(['true', 'false']).optional(),
    }),
  }),
  profileController.getProfile
);

export default router;
