import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import { CustomizationOptionValidations } from './customizationOption.validation';
import { CustomizationOptionController } from './customizationOption.controller';

const router = express.Router();

router.get(
  '/',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.STORE_OWNER, USER_ROLES.CUSTOMER),
  CustomizationOptionController.getAllCustomizationOptions,
);

router.get(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.STORE_OWNER, USER_ROLES.CUSTOMER),
  CustomizationOptionController.getSingleCustomizationOption,
);

router.post(
  '/',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.STORE_OWNER),
  validateRequest(
    CustomizationOptionValidations.createCustomizationOptionValidationSchema,
  ),
  CustomizationOptionController.createCustomizationOption,
);

router.patch(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.STORE_OWNER),
  validateRequest(
    CustomizationOptionValidations.updateCustomizationOptionValidationSchema,
  ),
  CustomizationOptionController.updateCustomizationOption,
);

router.delete(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.STORE_OWNER),
  CustomizationOptionController.deleteCustomizationOption,
);

export const CustomizationOptionRoutes = router;
