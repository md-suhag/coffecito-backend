import { z } from 'zod';

const subscribeZodSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email format'),
  }),
});

const unSubscribeZodSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email format'),
  }),
});

const sendEmailToSubscribersZodSchema = z.object({
  body: z.object({
    subject: z.string({ required_error: 'Subject is required' }),
    title: z.string({ required_error: 'Title is required' }),
    description: z.string({ required_error: 'Description is required' }),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

export const EmailSubscriptionValidations = {
  subscribeZodSchema,
  unSubscribeZodSchema,
  sendEmailToSubscribersZodSchema,
};
