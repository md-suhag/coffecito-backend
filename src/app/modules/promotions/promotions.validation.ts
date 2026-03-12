import { z } from 'zod';

const createPromotionsZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    url: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

const updateStatusZodSchema = z.object({
  body: z.object({
    isActive: z.boolean({ required_error: 'isActive status is required' }),
  }),
});

export const PromotionsValidations = {
  createPromotionsZodSchema,
  updateStatusZodSchema,
};