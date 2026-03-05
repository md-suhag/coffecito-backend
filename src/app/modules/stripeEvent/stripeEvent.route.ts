import express from 'express';
import { StripeEventController } from './stripeEvent.controller';

const router = express.Router();

// router.get('/', StripeEventController);

export const stripeEventRoutes = router;
