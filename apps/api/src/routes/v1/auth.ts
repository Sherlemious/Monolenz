import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';

const router: Router = Router();

// Strict rate limiting for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Very restrictive for auth
  keyGenerator: (req) => `auth:${req.ip}`,
  message: 'Too many authentication attempts, please try again later.',
});

router.use(authLimiter);

// Placeholder for future auth endpoints
router.get('/', (req, res) => {
  res.json({
    message: 'Authentication endpoints',
    note: 'Using Supabase for authentication',
    endpoints: {
      login: 'Use Supabase client',
      register: 'Use Supabase client',
      logout: 'Use Supabase client',
    },
  });
});

export default router;
