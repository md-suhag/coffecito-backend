import { z } from 'zod';
import { PAYMENT_METHOD } from './order.constants';

const createOrderValidationSchema = z.object({
  body: z.object({
    paymentMethod: z.enum(
      Object.values(PAYMENT_METHOD) as [string, ...string[]],
    ),
    tipAmount: z.number().optional().default(0),
    useLoyaltyPoints: z.boolean().optional().default(false),
    pickupTime: z.string().datetime().optional(),
  }),
});

export const OrderValidation = {
  createOrderValidationSchema,
};
