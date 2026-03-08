import express from 'express';
import { DisclaimerController } from './disclaimer.controller';
import validateRequest from '../../middlewares/validateRequest';
import { DisclaimerValidations } from './disclaimer.validation';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';

const router = express.Router();

// create or update disclaimer
router.post(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(DisclaimerValidations.createUpdateDisclaimerZodSchema),
  DisclaimerController.createUpdateDisclaimer
);

// get disclaimer by type
router.get(
  '/:type',
  validateRequest(DisclaimerValidations.getDisclaimerByTypeZodSchema),
  DisclaimerController.getDisclaimerByType
);

export const DisclaimerRoutes = router;
