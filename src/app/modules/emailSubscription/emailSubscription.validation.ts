import { z } from 'zod';

const subscribeZodSchema = z.object({
  body: z
    .object({
      email: z.string().email(),
    })
    .strict(),
});

const unSubscribeZodSchema = z.object({
  body: z
    .object({
      email: z.string().email(),
    })
    .strict(),
});

export const EmailSubscriptionValidations = {
  subscribeZodSchema,
  unSubscribeZodSchema,
};
