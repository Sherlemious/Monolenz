import { Router } from 'express';
import authRoutes from './auth';
import profileRoutes from './profiles.ts';

const router: Router = Router();

// Feature-based organization
router.use('/auth', authRoutes);
router.use('/profiles', profileRoutes);

// Version info
router.get('/', (req, res) => {
  res.json({
    version: 'v1',
    features: ['profiles', 'authentication'],
    status: 'stable',
    endpoints: {
      auth: '/api/v1/auth',
      profiles: '/api/v1/profiles',
    },
  });
});

export default router;
