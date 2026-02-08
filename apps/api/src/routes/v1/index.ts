import { Router } from 'express';
import authRoutes from './auth';
import profileRoutes from './profiles.ts';
import uploadRoutes from './upload';

const router: Router = Router();

// Feature-based organization
router.use('/auth', authRoutes);
router.use('/profiles', profileRoutes);
router.use('/upload', uploadRoutes);

// Version info
router.get('/', (req, res) => {
  res.json({
    version: 'v1',
    features: ['profiles', 'authentication', 'file-upload'],
    status: 'stable',
    endpoints: {
      auth: '/api/v1/auth',
      profiles: '/api/v1/profiles',
      upload: '/api/v1/upload',
    },
  });
});

export default router;
