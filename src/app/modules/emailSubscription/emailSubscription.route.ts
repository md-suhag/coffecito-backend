import express from 'express';
import { EmailSubscriptionController } from './emailSubscription.controller';

import { EmailSubscriptionValidations } from './emailSubscription.validation';
import validateRequest from '../../middlewares/validateRequest';

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

export const emailSubscriptionRoutes = router;
