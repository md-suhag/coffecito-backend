import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { EmailSubscriptionController } from './emailSubscription.controller';
import { EmailSubscriptionValidations } from './emailSubscription.validation';
import { USER_ROLES } from '../user/user.constant';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post(
  '/subscribe',
  validateRequest(EmailSubscriptionValidations.subscribeZodSchema),
  EmailSubscriptionController.subscribe,
);

router.post(
  '/unsubscribe',
  validateRequest(EmailSubscriptionValidations.unSubscribeZodSchema),
  EmailSubscriptionController.unSubscribe,
);

router.post(
  '/send-email',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.MARKETER),
  validateRequest(EmailSubscriptionValidations.sendEmailToSubscribersZodSchema),
  EmailSubscriptionController.sendEmailToSubscribers,
);

export const emailSubscriptionRoutes = router;
