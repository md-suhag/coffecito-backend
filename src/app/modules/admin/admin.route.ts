import express from 'express';
import { AdminController } from './admin.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { AdminValidations } from './admin.validation';

const router = express.Router();

router.post(
  '/categories',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(AdminValidations.createCategoryZodSchema),
  AdminController.createCategory,
);

router.patch(
  '/categories/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(AdminValidations.updateCategoryZodSchema),
  AdminController.updateCategory,
);

router.post(
  '/contact-us',
  validateRequest(AdminValidations.contactUsSchema),
  AdminController.contactUs,
);

export const adminRoutes = router;
