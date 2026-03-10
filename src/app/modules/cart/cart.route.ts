import express from 'express';
import { CartController } from './cart.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { CartValidations } from './cart.validation';

const router = express.Router();

router.get(
  '/',
  auth(USER_ROLES.CUSTOMER, USER_ROLES.ADMIN),
  CartController.getCart,
);

router.post(
  '/',
  auth(USER_ROLES.CUSTOMER),
  validateRequest(CartValidations.addToCartValidationSchema),
  CartController.addToCart,
);

router.patch(
  '/update-quantity',
  auth(USER_ROLES.CUSTOMER),
  validateRequest(CartValidations.updateQuantityValidationSchema),
  CartController.updateQuantity,
);

router.delete(
  '/remove-item/:itemId',
  auth(USER_ROLES.CUSTOMER),
  CartController.removeItemFromCart,
);

router.delete('/clear', auth(USER_ROLES.CUSTOMER), CartController.clearCart);

export const cartRoutes = router;
