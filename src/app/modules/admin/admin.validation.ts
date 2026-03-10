import { z } from 'zod';
import { USER_STATUS } from '../user/user.constant';

const createCategoryZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Category name is required' }),
  }),
});

const updateCategoryZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
  }),
});

const contactUsSchema = z.object({
  body: z
    .object({
      name: z
        .string({ required_error: 'Name is required' })
        .min(2, 'Name must be at least 2 characters long'),
      email: z
        .string({ required_error: 'Email is required' })
        .email('Invalid email address'),
      subject: z
        .string({ required_error: 'Subject is required' })
        .min(2, 'Subject must be at least 2 characters long'),
      message: z
        .string({ required_error: 'Message is required' })
        .min(2, 'Message must be at least 2 characters long'),
    })
    .strict(),
});

const updateCustomerStatusZodSchema = z.object({
  body: z
    .object({
      status: z.nativeEnum(USER_STATUS),
    })
    .strict(),
});

export const AdminValidations = {
  createCategoryZodSchema,
  updateCategoryZodSchema,
  contactUsSchema,
  updateCustomerStatusZodSchema,
};
