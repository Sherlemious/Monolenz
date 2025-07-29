import { Router } from 'express';
import profileRoutes from './profiles';
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

export default router;
