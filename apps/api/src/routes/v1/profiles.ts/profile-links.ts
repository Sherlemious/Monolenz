import { Router } from 'express';
import { profileLinkController } from '../../../controllers';
import { authenticate, requireProfile } from '../../../middleware/auth';
import { validate } from '../../../middleware/validation';
import { profileLinkSchemas } from '@athaar/types/validation';
import { z } from 'zod';

const router: Router = Router({ mergeParams: true }); // Important for nested routes

// All routes are protected and require profile
router.use(authenticate);
router.use(requireProfile);

// Middleware to verify profile ownership
router.use((req, res, next) => {
  const profileId = req.params.profileId || req.params.parentProfileId;
  if (profileId && profileId !== req.userId) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'You can only access your own profile links',
    });
  }
  next();
});

// Link operations
router.post('/', validate({ body: profileLinkSchemas.create }), profileLinkController.createLink);

router.get('/', profileLinkController.getMyLinks);

router.get(
  '/:linkId',
  validate({
    params: z.object({
      linkId: z
        .string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => !isNaN(val) && val > 0, 'Invalid link ID'),
    }),
  }),
  profileLinkController.getLink
);

router.put(
  '/:linkId',
  validate({
    params: z.object({ linkId: z.string().transform((val) => parseInt(val, 10)) }),
    body: profileLinkSchemas.update,
  }),
  profileLinkController.updateLink
);

router.delete(
  '/:linkId',
  validate({
    params: z.object({ linkId: z.string().transform((val) => parseInt(val, 10)) }),
  }),
  profileLinkController.deleteLink
);

router.patch(
  '/:linkId/toggle-visibility',
  validate({
    params: z.object({ linkId: z.string().transform((val) => parseInt(val, 10)) }),
  }),
  profileLinkController.toggleVisibility
);

// Bulk operations
router.post(
  '/reorder',
  validate({
    body: z.object({
      linkOrders: z
        .array(
          z.object({
            id: z.number().positive(),
            sort_order: z.number().min(0),
          })
        )
        .min(1),
    }),
  }),
  profileLinkController.reorderLinks
);

export default router;
