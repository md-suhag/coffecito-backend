import { z } from 'zod';

const createCategoryZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
  }),
});

export const AdminValidations = {
  createCategoryZodSchema,
};
