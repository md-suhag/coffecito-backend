import express from 'express';
import { GiftCardTransactionController } from './giftCardTransaction.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';

const router = express.Router();

router.get(
  '/',
  auth(USER_ROLES.CUSTOMER),
  GiftCardTransactionController.getMyGiftCardTransactions,
);

export const giftCardTransactionRoutes = router;
