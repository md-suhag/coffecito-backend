import express from 'express';
import { WalletTransactionController } from './walletTransaction.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';

const router = express.Router();

router.get(
  '/',
  auth(USER_ROLES.CUSTOMER),
  WalletTransactionController.getMyWalletTransactions,
);

router.get(
  '/:id',
  auth(USER_ROLES.CUSTOMER),
  WalletTransactionController.getTransactionDetails,
);

export const walletTransactionRoutes = router;
