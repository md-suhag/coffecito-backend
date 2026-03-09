import express from 'express';
import { StoreController } from './store.controller';
import validateRequest from '../../middlewares/validateRequest';
import { StoreValidations } from './store.validation';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  fileUploadHandler(),
  validateRequest(StoreValidations.createStoreValidationSchema),
  StoreController.createStore,
);

router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  fileUploadHandler(),
  validateRequest(StoreValidations.updateStoreValidationSchema),
  StoreController.updateStore,
);

router.delete(
  '/:id/soft',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  StoreController.deleteStore,
);

router.get(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  StoreController.getAllStores,
);

router.post(
  '/:id/connect-stripe',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  StoreController.connectStripe,
);

export const storeAdminRoutes = router;
