import express from 'express';
import { PointTransactionController } from './pointTransaction.controller';

import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';

const router = express.Router();

router.get(
  '/my-history',
  auth(USER_ROLES.CUSTOMER),
  PointTransactionController.getMyPointTransactions,
);

export const pointTransactionRoutes = router;
