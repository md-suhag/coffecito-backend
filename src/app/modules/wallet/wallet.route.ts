import express from 'express';
import { WalletController } from './wallet.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { WalletValidations } from './wallet.validation';

const router = express.Router();

router.post(
  '/add-money',
  auth(USER_ROLES.CUSTOMER),
  validateRequest(WalletValidations.addMoneyIntoWalletZodSchema),
  WalletController.addMoneyIntoWallet,
);

router.get('/balance', auth(USER_ROLES.CUSTOMER), WalletController.getMyWallet);

export const walletRoutes = router;
