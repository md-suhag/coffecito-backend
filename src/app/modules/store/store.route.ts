import express from 'express';
import { StoreController } from './store.controller';
import validateRequest from '../../middlewares/validateRequest';
import { StoreValidations } from './store.validation';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

import authOptional from '../../middlewares/authOptional';

const router = express.Router();

router.get('/', StoreController.getAllStoresForCustomer);

router.get(
  '/:id/products',
  authOptional(),
  StoreController.getAllProductsOfAStore,
);

export const storeRoutes = router;
