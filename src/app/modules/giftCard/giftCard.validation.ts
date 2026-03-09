import { z } from 'zod';

const createGiftCardZodSchema = z.object({
  body: z.object({
    amount: z.number().positive().int(),
    receiverEmail: z.string().email(),
    receiverName: z.string().min(1),
    message: z.string().optional(),
  }),
});

export const GiftCardValidations = {
  createGiftCardZodSchema,
};
