import { z } from 'zod';
import { USER_ROLES, USER_STATUS } from '../user/user.constant';
import { ORDER_STATUS } from '../order/order.constants';

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

const updateOrderZodSchema = z.object({
  body: z
    .object({
      status: z.nativeEnum(ORDER_STATUS),
    })
    .strict(),
});

const createUserZodSchema = z.object({
  body: z
    .object({
      name: z.string({ required_error: 'Name is required' }),
      email: z.string({ required_error: 'Email is required' }).email(),
      password: z
        .string({ required_error: 'Password is required' })
        .min(8, 'Password must be at least 8 characters long'),
      role: z.enum([USER_ROLES.ADMIN, USER_ROLES.MARKETER, USER_ROLES.BARISTA]),
      store: z.string().optional(),
      phone: z.string().optional(),
    })
    .refine(
      data =>
        ![USER_ROLES.ADMIN, USER_ROLES.BARISTA].includes(data.role) ||
        Boolean(data.store),
      {
        message: 'Store is required for ADMIN and BARISTA',
        path: ['store'],
      },
    ),
});

export const AdminValidations = {
  createCategoryZodSchema,
  updateCategoryZodSchema,
  contactUsSchema,
  updateCustomerStatusZodSchema,
  updateOrderZodSchema,
  createUserZodSchema,
};
