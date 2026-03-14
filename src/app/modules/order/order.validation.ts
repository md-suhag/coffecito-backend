import { z } from 'zod';
import { PAYMENT_METHOD } from './order.constants';

const createOrderValidationSchema = z.object({
  body: z.object({
    paymentMethod: z.enum(
      Object.values(PAYMENT_METHOD) as [string, ...string[]],
    ),
    tipAmount: z.number().nonnegative().int().optional().default(0),
    loyaltyPointsToUse: z.number().nonnegative().int().optional().default(0),
    pickupTime: z.string().datetime().optional(),
  }),
});

export const OrderValidation = {
  createOrderValidationSchema,
};
