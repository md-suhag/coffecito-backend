import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import { NotificationController } from './notification.controller';
import { NotificationValidations } from './notification.validation';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

router.get(
  '/',
  auth(
    USER_ROLES.CUSTOMER,
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.MARKETER,
  ),
  NotificationController.getMyNotifications,
);

router.get(
  '/all-notifications',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.MARKETER),
  NotificationController.getAllNotifications,
);

router.post(
  '/send-notification',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.MARKETER),
  validateRequest(NotificationValidations.sendNotificationZodSchema),
  NotificationController.sendNotification,
);

router.patch(
  '/mark-all-as-read',
  auth(
    USER_ROLES.CUSTOMER,
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.MARKETER,
  ),
  NotificationController.markAllAsRead,
);

router.patch(
  '/:id/mark-as-read',
  auth(
    USER_ROLES.CUSTOMER,
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.MARKETER,
  ),
  NotificationController.markAsRead,
);

export const notificationRoutes = router;
