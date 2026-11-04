import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { resumeController } from '../../controllers/resume/resume.controller';
import {
  resumeCreateSchema,
  resumeIdParamsSchema,
  resumeTailorApplySchema,
  resumeTailorSchema,
  resumeUpdateSchema,
} from '@monolenz/types/validation/resume-schemas';

const router: Router = Router();

const tailorLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  keyGenerator: (req) => `tailor:${req.ip}:${req.userId || 'anonymous'}`,
  message: 'Too many tailor requests, please try again later.',
});

router.use(authenticate);

router.get('/', resumeController.list);
router.post('/', validate({ body: resumeCreateSchema }), resumeController.create);
router.post(
  '/:id/tailor/apply',
  tailorLimiter,
  validate({ params: resumeIdParamsSchema, body: resumeTailorApplySchema }),
  resumeController.applyTailor
);
router.post(
  '/:id/tailor',
  tailorLimiter,
  validate({ params: resumeIdParamsSchema, body: resumeTailorSchema }),
  resumeController.tailor
);
router.get('/:id/pdf', validate({ params: resumeIdParamsSchema }), resumeController.downloadPdf);
router.get('/:id', validate({ params: resumeIdParamsSchema }), resumeController.get);
router.put('/:id', validate({ params: resumeIdParamsSchema, body: resumeUpdateSchema }), resumeController.update);
router.delete('/:id', validate({ params: resumeIdParamsSchema }), resumeController.delete);

export default router;
