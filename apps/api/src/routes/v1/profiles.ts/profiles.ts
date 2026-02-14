import { Router } from 'express';
import { profileController } from '../../../controllers/profile';
import { authenticate, optionalAuth } from '../../../middleware/auth';
import { validate } from '../../../middleware/validation';
import { profileSchemas } from '@monolenz/types/validation';
import { z } from 'zod';
import profileBlockRouter from './blocks.routes';
import {
  identifierParamsSchema,
  searchQuerySchema,
  usernameParamsSchema,
  getProfileQuerySchema,
} from './schemas';

const router: Router = Router();

// Public routes (no auth)
router.get(
  '/public/:identifier',
  validate({
    params: identifierParamsSchema,
  }),
  profileController.getPublicProfile
);

router.get(
  '/search',
  optionalAuth, // Optional for better search experience
  validate({
    query: searchQuerySchema,
  }),
  profileController.searchProfiles
);

router.get(
  '/username/:username/availability',
  optionalAuth,
  validate({
    params: usernameParamsSchema,
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

router.get(
  '/:identifier',
  validate({
    params: identifierParamsSchema,
    query: getProfileQuerySchema,
  }),
  profileController.getProfile
);

export default router;
