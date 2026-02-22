import express from 'express';
import { WalletTransactionController } from './walletTransaction.controller';

const router = express.Router();

router.get('/', WalletTransactionController);

export const walletTransactionRoutes = router;