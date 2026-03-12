import express from 'express';
import { AnalyticsController } from './analytics.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';

const router = express.Router();

router.get(
  '/summary-cards',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  AnalyticsController.getSummaryCardsData,
);

router.get(
  '/gross-revenue-by-month',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  AnalyticsController.getRevenueByMonth,
);

export const analyticsRoutes = router;
