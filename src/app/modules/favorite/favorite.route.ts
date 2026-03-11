import express from 'express';
import { FavoriteController } from './favorite.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { FavoriteValidations } from './favorite.validation';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLES.CUSTOMER),
  validateRequest(FavoriteValidations.addFavoriteZodSchema),
  FavoriteController.addFavorite,
);

router.delete(
  '/',
  auth(USER_ROLES.CUSTOMER),
  validateRequest(FavoriteValidations.removeFavoriteZodSchema),
  FavoriteController.removeFavorite,
);

router.get(
  '/products',
  auth(USER_ROLES.CUSTOMER),
  FavoriteController.getMyFavoriteProducts,
);
router.get(
  '/stores',
  auth(USER_ROLES.CUSTOMER),
  FavoriteController.getMyFavoriteStores,
);

export const favoriteRoutes = router;
