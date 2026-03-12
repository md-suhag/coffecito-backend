import express from 'express';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLES } from '../user/user.constant';
import { PromotionsController } from './promotions.controller';
import { PromotionsValidations } from './promotions.validation';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  fileUploadHandler(),
  validateRequest(PromotionsValidations.createPromotionsZodSchema),
  PromotionsController.createPromotions,
);

router.get('/', PromotionsController.getActivePromotions);

router.get('/admin', PromotionsController.getAllPromotions);

router.patch(
  '/:id/status',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  validateRequest(PromotionsValidations.updateStatusZodSchema),
  PromotionsController.updateStatus,
);

router.delete(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  PromotionsController.deletePromotions,
);

export const promotionsRoutes = router;
