import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import * as authController from '../../controllers/auth.controller';
import { authenticate } from '../../middleware/auth';

const router: Router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => `auth:${req.ip}`,
  message: 'Too many authentication attempts, please try again later.',
});

router.use(authLimiter);

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticate, authController.me);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

export default router;
