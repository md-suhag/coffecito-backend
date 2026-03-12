import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import { NotificationController } from './notification.controller';

const router = express.Router();

router.get(
  '/',
  auth(USER_ROLES.CUSTOMER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  NotificationController.getMyNotifications
);

router.patch(
  '/mark-all-as-read',
  auth(USER_ROLES.CUSTOMER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  NotificationController.markAllAsRead
);

router.patch(
  '/:id/mark-as-read',
  auth(USER_ROLES.CUSTOMER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  NotificationController.markAsRead
);

export const notificationRoutes = router;
