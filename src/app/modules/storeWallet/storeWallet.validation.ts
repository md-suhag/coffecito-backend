import { z } from 'zod';

const processPayoutValidationSchema = z.object({
  body: z.object({
    amount: z
      .number({ required_error: 'Amount is required' })
      .positive('Amount must be greater than 0'),
    note: z.string().optional(),
  }),
});

export const StoreWalletValidations = {
  processPayoutValidationSchema,
};
