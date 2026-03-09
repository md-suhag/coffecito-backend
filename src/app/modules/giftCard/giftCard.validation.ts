import { z } from 'zod';

const createGiftCardZodSchema = z.object({
  body: z.object({
    amount: z.number().int().min(1),
    receiverEmail: z.string().email(),
    receiverName: z.string().min(1),
    message: z.string().optional(),
  }),
});

const addGiftCardZodSchema = z.object({
  body: z.object({
    cardNumber: z.string({
      required_error: 'Card number is required',
    }),
  }),
});

export const GiftCardValidations = {
  createGiftCardZodSchema,
  addGiftCardZodSchema,
};
