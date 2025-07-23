import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';

const router: ExpressRouter = Router();

// Health check for API routes
router.get('/', (req, res) => {
  res.json({
    message: 'Athaar API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// TODO: Add your API routes here
// Example:
// router.use('/users', userRoutes);
// router.use('/auth', authRoutes);

export default router;