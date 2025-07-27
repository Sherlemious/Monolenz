import { Router } from 'express';
import profileRoutes from './profiles';
import profileLinkRoutes from './profile-links';
import { authenticate, optionalAuth } from '../../../middleware/auth';
import { rateLimit } from 'express-rate-limit';

const router: Router = Router();

// Feature-specific rate limiting
const profileRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, // More generous for profiles
  keyGenerator: (req) => `profiles:${req.ip}:${req.userId || 'anonymous'}`,
  message: 'Too many profile requests, please try again later.',
});

router.use(profileRateLimit);

// Main profile routes
router.use('/', profileRoutes);

// Sub-resource routes with parameter passing
router.use(
  '/:profileId/links',
  (req, res, next) => {
    // Pass profile ID to sub-routes
    req.params.parentProfileId = req.params.profileId;
    next();
  },
  profileLinkRoutes
);

export default router;
