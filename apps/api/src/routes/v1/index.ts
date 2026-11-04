import { Router } from 'express';
import authRoutes from './auth';
import profileRoutes from './profiles.ts';
import resumeRoutes from './resumes';

const router: Router = Router();

router.use('/auth', authRoutes);
router.use('/profiles', profileRoutes);
router.use('/resumes', resumeRoutes);

router.get('/', (req, res) => {
  res.json({
    version: 'v1',
    features: ['profiles', 'authentication', 'resumes'],
    status: 'stable',
    endpoints: {
      auth: '/api/v1/auth',
      profiles: '/api/v1/profiles',
      resumes: '/api/v1/resumes',
    },
  });
});

export default router;
