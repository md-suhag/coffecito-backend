import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import { StoreWalletController } from './storeWallet.controller';
import validateRequest from '../../middlewares/validateRequest';
import { StoreWalletValidations } from './storeWallet.validation';

const router = express.Router();

// Get all store wallets (Super Admin only)
router.get(
  '/',
  auth(USER_ROLES.SUPER_ADMIN),
  StoreWalletController.getAllStoreWallets,
);

// Get a specific store's wallet
router.get(
  '/:storeId',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  StoreWalletController.getStoreWalletByStoreId,
);

// Get transactions for a specific store
router.get(
  '/:storeId/transactions',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  StoreWalletController.getStoreTransactions,
);

// Process payout for a specific store (Super Admin only)
router.post(
  '/:storeId/payout',
  auth(USER_ROLES.SUPER_ADMIN),
  validateRequest(StoreWalletValidations.processPayoutValidationSchema),
  StoreWalletController.processPayout,
);

export const storeWalletRoutes = router;
