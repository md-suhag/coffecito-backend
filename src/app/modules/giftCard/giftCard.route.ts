import express from 'express';
import { GiftCardController } from './giftCard.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { GiftCardValidations } from './giftCard.validation';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLES.CUSTOMER),
  validateRequest(GiftCardValidations.createGiftCardZodSchema),
  GiftCardController.createGiftCard,
);

export const giftCardRoutes = router;
