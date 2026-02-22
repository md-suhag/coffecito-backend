import express from 'express';
import { PointTransactionController } from './pointTransaction.controller';

const router = express.Router();

router.get('/', PointTransactionController);

export const pointTransactionRoutes = router;