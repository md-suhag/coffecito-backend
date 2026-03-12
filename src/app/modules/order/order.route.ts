import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { OrderValidation } from './order.validation';
import { OrderController } from './order.controller';

const router = express.Router();

router.get(
  '/upcoming',
  auth(USER_ROLES.CUSTOMER),
  OrderController.getMyUpcomingOrders,
);
router.get(
  '/completed',
  auth(USER_ROLES.CUSTOMER),
  OrderController.getMyCompletedOrders,
);

router.post(
  '/',
  auth(USER_ROLES.CUSTOMER),
  validateRequest(OrderValidation.createOrderValidationSchema),
  OrderController.createOrder,
);

router.get(
  '/:id',
  auth(USER_ROLES.CUSTOMER),
  OrderController.getMyOrderDetails,
);

export const orderRoutes = router;
