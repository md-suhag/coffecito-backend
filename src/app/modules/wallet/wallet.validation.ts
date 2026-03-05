import { z } from 'zod';

const addMoneyIntoWalletZodSchema = z.object({
  body: z.object({
    amount: z
      .number()
      .positive('Amount must be positive')
      .int('Amount must be an integer'),
  }),
});

export const WalletValidations = {
  addMoneyIntoWalletZodSchema,
};
