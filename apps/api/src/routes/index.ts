import { Router } from 'express';
import { preprocessRequest, formatResponse } from '../middleware/request-response';
import v1Routes from './v1';

const router: Router = Router();

// Global API middleware
router.use(preprocessRequest);
router.use(formatResponse);

// API versioning
router.use('/v1', v1Routes);

// Root API info
router.get('/', (req, res) => {
  res.json({
    name: 'Monolenz API',
    version: '1.0.0',
    description: 'Resume and portfolio management platform',
    endpoints: {
      v1: '/api/v1',
      health: '/health',
      docs: '/api/docs', // Future API documentation
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
